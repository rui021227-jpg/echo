// Supabase Edge Function: revenuecat-webhook
// Receives RevenueCat V2 subscription events and maintains subscription state.
// Deploy with: supabase functions deploy revenuecat-webhook

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// RevenueCat V2 webhook payload
interface RevenueCatEvent {
  id: string;
  type: string;
  app_user_id: string;
  original_app_user_id: string;
  aliases?: string[];
  product_id?: string;
  period_type?: 'NORMAL' | 'TRIAL' | 'INTRO';
  purchased_at_ms?: number;
  expiration_at_ms?: number | null;
  environment: 'SANDBOX' | 'PRODUCTION';
  store?: 'APP_STORE' | 'PLAY_STORE';
  price_in_purchased_currency?: number | null;
  currency?: string | null;
  country_code?: string | null;
}

interface RevenueCatWebhookPayload {
  event: RevenueCatEvent;
  api_version: string;
}

// Event types that indicate active premium
const PREMIUM_ACTIVE_EVENTS = new Set([
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
]);

// Event types that end premium access
const PREMIUM_ENDED_EVENTS = new Set([
  'EXPIRATION',
  'CANCELLATION',
]);

// Events we log but don't change premium status for
const NEUTRAL_EVENTS = new Set([
  'BILLING_ISSUE',
  'SUBSCRIBER_ALIAS',
  'TRANSFER',
  'NON_SUBSCRIPTION_PURCHASE',
]);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function assertNoError(context: string, error: unknown): void {
  if (!error) {
    return;
  }

  console.error(`${context}:`, error);
  throw error;
}

Deno.serve(async (req: Request) => {
  // RevenueCat only sends POST; no CORS needed (server-to-server)
  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  // Verify webhook auth token
  const authHeader = req.headers.get('Authorization') ?? '';
  const expectedToken = Deno.env.get('REVENUECAT_WEBHOOK_AUTH_TOKEN');

  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    console.error('Webhook auth failed — missing or wrong token');
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }

  let payload: RevenueCatWebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400);
  }

  const { event } = payload;

  if (!event?.id || !event?.type || !event?.app_user_id) {
    return jsonResponse({ error: 'Malformed event payload' }, 400);
  }

  console.log(`RevenueCat event received: ${event.type} (${event.id}) user=${event.app_user_id}`);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    // Store the raw event (upsert on event_id for idempotency — RevenueCat may retry)
    const { error: insertError } = await supabase.from('subscription_events').upsert(
      {
        event_id: event.id,
        event_type: event.type,
        app_user_id: event.app_user_id,
        product_id: event.product_id ?? null,
        price_in_purchased_currency: event.price_in_purchased_currency ?? null,
        currency: event.currency ?? null,
        country_code: event.country_code ?? null,
        original_app_user_id: event.original_app_user_id ?? null,
        period_type: event.period_type ?? null,
        purchased_at: event.purchased_at_ms ? new Date(event.purchased_at_ms).toISOString() : null,
        expiration_at: event.expiration_at_ms ? new Date(event.expiration_at_ms).toISOString() : null,
        environment: event.environment,
        store: event.store ?? null,
        raw_event: payload,
        received_at: new Date().toISOString(),
      },
      { onConflict: 'event_id', ignoreDuplicates: true }, // idempotent — skip duplicate deliveries
    );

    if (insertError) {
      assertNoError('Failed to store event', insertError);
    }

    // Update subscription_status based on event type
    if (PREMIUM_ACTIVE_EVENTS.has(event.type)) {
      const { error } = await supabase.from('subscription_status').upsert(
        {
          app_user_id: event.app_user_id,
          is_premium: true,
          product_id: event.product_id ?? null,
          expiration_at: event.expiration_at_ms
            ? new Date(event.expiration_at_ms).toISOString()
            : null,
          last_event_type: event.type,
          last_event_at: new Date().toISOString(),
        },
        { onConflict: 'app_user_id' },
      );
      assertNoError('Failed to upsert active subscription status', error);
    } else if (PREMIUM_ENDED_EVENTS.has(event.type)) {
      const { error } = await supabase.from('subscription_status').upsert(
        {
          app_user_id: event.app_user_id,
          is_premium: false,
          product_id: event.product_id ?? null,
          expiration_at: event.expiration_at_ms
            ? new Date(event.expiration_at_ms).toISOString()
            : null,
          last_event_type: event.type,
          last_event_at: new Date().toISOString(),
        },
        { onConflict: 'app_user_id' },
      );
      assertNoError('Failed to upsert ended subscription status', error);
    } else if (NEUTRAL_EVENTS.has(event.type)) {
      // Log the event type but don't change premium status
      const { error } = await supabase
        .from('subscription_status')
        .update({ last_event_type: event.type, last_event_at: new Date().toISOString() })
        .eq('app_user_id', event.app_user_id);
      assertNoError('Failed to update neutral subscription status', error);
    }

    console.log(`Event ${event.id} processed successfully`);
    return jsonResponse({ received: true });
  } catch (err) {
    console.error('revenuecat-webhook error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
