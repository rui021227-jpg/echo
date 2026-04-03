import type { ExpoConfig } from 'expo/config';

const { expo: baseConfig } = require('./app.json') as { expo: ExpoConfig };

function getEnv(name: string): string {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function getBasePlugins(): NonNullable<ExpoConfig['plugins']> {
  return [...(baseConfig.plugins ?? [])].filter((plugin) => {
    if (typeof plugin === 'string') {
      return plugin !== '@sentry/react-native/expo' && plugin !== '@sentry/react-native';
    }

    return plugin[0] !== '@sentry/react-native/expo' && plugin[0] !== '@sentry/react-native';
  });
}

export default (): ExpoConfig => ({
  ...baseConfig,
  plugins: (() => {
    const sentryOrg = getEnv('SENTRY_ORG');
    const sentryProject = getEnv('SENTRY_PROJECT');
    const sentryAuthToken = getEnv('SENTRY_AUTH_TOKEN');
    const sentryUrl = getEnv('SENTRY_URL');
    const plugins = getBasePlugins();

    if (sentryOrg && sentryProject) {
      plugins.push([
        '@sentry/react-native',
        {
          organization: sentryOrg,
          project: sentryProject,
          ...(sentryAuthToken ? { authToken: sentryAuthToken } : {}),
          ...(sentryUrl ? { url: sentryUrl } : {}),
        },
      ]);
    }

    return plugins;
  })(),
  extra: {
    ...(baseConfig.extra ?? {}),
    sentryDsn: getEnv('EXPO_PUBLIC_SENTRY_DSN'),
    supabaseEdgeFunctionUrl: getEnv('EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL'),
    supabaseCloudSyncUrl: getEnv('EXPO_PUBLIC_SUPABASE_CLOUD_SYNC_URL'),
    revenueCatIosKey: getEnv('EXPO_PUBLIC_REVENUECAT_IOS_KEY'),
    revenueCatAndroidKey: getEnv('EXPO_PUBLIC_REVENUECAT_ANDROID_KEY'),
    privacyPolicyUrl: getEnv('EXPO_PUBLIC_PRIVACY_POLICY_URL'),
  },
});
