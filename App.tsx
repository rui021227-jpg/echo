import 'react-native-reanimated';
import 'react-native-gesture-handler';
import * as Sentry from '@sentry/react-native';
import { AppRoot } from './src/app/AppRoot';
import { RUNTIME_CONFIG, warnMissingRuntimeConfig } from './src/config/runtime';

if (!RUNTIME_CONFIG.sentryDsn) {
  warnMissingRuntimeConfig(
    'sentryDsn',
    'Sentry is disabled until EXPO_PUBLIC_SENTRY_DSN is set.',
  );
}

Sentry.init({
  dsn: RUNTIME_CONFIG.sentryDsn,
  // No user identification — consistent with no-account policy
  // No session replay, no performance monitoring
  tracesSampleRate: 0,
  debug: __DEV__,
  enabled: Boolean(RUNTIME_CONFIG.sentryDsn) && !__DEV__,
});

export default Sentry.wrap(function App() {
  return <AppRoot />;
});
