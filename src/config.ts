import Constants from 'expo-constants';

type RuntimeExtra = {
  sentryDsn?: string;
  supabaseEdgeFunctionUrl?: string;
  revenueCatIosKey?: string;
  revenueCatAndroidKey?: string;
  privacyPolicyUrl?: string;
};

const PLACEHOLDER_PREFIX = 'YOUR_';
const warnedKeys = new Set<string>();

function normalizeConfigValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;

  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith(PLACEHOLDER_PREFIX)) {
    return undefined;
  }

  return trimmed;
}

const extra = (Constants.expoConfig?.extra ?? {}) as RuntimeExtra;

export const RUNTIME_CONFIG = {
  sentryDsn: normalizeConfigValue(extra.sentryDsn),
  supabaseEdgeFunctionUrl: normalizeConfigValue(extra.supabaseEdgeFunctionUrl),
  revenueCatIosKey: normalizeConfigValue(extra.revenueCatIosKey),
  revenueCatAndroidKey: normalizeConfigValue(extra.revenueCatAndroidKey),
  privacyPolicyUrl: normalizeConfigValue(extra.privacyPolicyUrl),
} as const;

export type RuntimeConfigKey = keyof typeof RUNTIME_CONFIG;

export function warnMissingRuntimeConfig(
  key: RuntimeConfigKey,
  fallbackBehavior: string,
): void {
  if (!__DEV__ || warnedKeys.has(key) || RUNTIME_CONFIG[key]) {
    return;
  }

  warnedKeys.add(key);
  console.warn(`[runtime-config] Missing ${key}. ${fallbackBehavior}`);
}
