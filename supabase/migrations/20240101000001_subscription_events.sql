-- Subscription event log from RevenueCat webhooks
CREATE TABLE IF NOT EXISTS subscription_events (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT UNIQUE NOT NULL,              -- RevenueCat event ID (idempotency key)
  event_type TEXT NOT NULL,                   -- INITIAL_PURCHASE, RENEWAL, CANCELLATION, etc.
  app_user_id TEXT NOT NULL,                  -- RevenueCat anonymous user ID
  product_id TEXT,                            -- e.g. 'echo_premium_monthly'
  price_in_purchased_currency NUMERIC,
  currency TEXT,
  country_code TEXT,
  original_app_user_id TEXT,
  period_type TEXT,                           -- NORMAL, TRIAL, INTRO
  purchased_at TIMESTAMPTZ,
  expiration_at TIMESTAMPTZ,
  environment TEXT,                           -- SANDBOX or PRODUCTION
  store TEXT,                                 -- APP_STORE or PLAY_STORE
  raw_event JSONB NOT NULL,                   -- Full webhook payload for debugging/replay
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Current subscription status per user (updated on each relevant event)
CREATE TABLE IF NOT EXISTS subscription_status (
  app_user_id TEXT PRIMARY KEY,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  product_id TEXT,
  expiration_at TIMESTAMPTZ,
  last_event_type TEXT,
  last_event_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sub_events_user
  ON subscription_events(app_user_id);

CREATE INDEX IF NOT EXISTS idx_sub_events_type_time
  ON subscription_events(event_type, received_at DESC);

CREATE INDEX IF NOT EXISTS idx_sub_status_premium
  ON subscription_status(is_premium)
  WHERE is_premium = true;
