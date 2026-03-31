import { Platform, BackHandler } from 'react-native';

/**
 * Closes the app. On Android, uses BackHandler.exitApp().
 * On iOS, there is no public API to exit — the app navigates to an inert
 * completion state and the user swipes away naturally.
 * Returns true if the platform supports programmatic close.
 */
export function closeApp(): boolean {
  if (Platform.OS === 'android') {
    BackHandler.exitApp();
    return true;
  }
  // iOS: cannot programmatically exit. Caller should show inert state.
  return false;
}
