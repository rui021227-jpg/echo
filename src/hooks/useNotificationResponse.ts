import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import {
  getNotificationResponseId,
  getNotificationType,
  shouldHandleNotificationResponse,
  type NotificationType,
} from '../services/notifications';

export function useNotificationResponse(
  onNotification: (type: NotificationType, data: Record<string, unknown>) => void,
  enabled = true,
) {
  const callbackRef = useRef(onNotification);
  const lastHandledResponseIdRef = useRef<string | null>(null);
  callbackRef.current = onNotification;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleResponse = async (
      response: Notifications.NotificationResponse,
      clearAfterHandling: boolean,
    ) => {
      if (!shouldHandleNotificationResponse(lastHandledResponseIdRef.current, response)) {
        if (clearAfterHandling) {
          await Notifications.clearLastNotificationResponseAsync();
        }
        return;
      }

      lastHandledResponseIdRef.current = getNotificationResponseId(response);

      const type = getNotificationType(response);
      const data = (response.notification.request.content.data ?? {}) as Record<string, unknown>;
      callbackRef.current(type, data);

      if (clearAfterHandling) {
        await Notifications.clearLastNotificationResponseAsync();
      }
    };

    // Handle notification tapped while app was open
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        void handleResponse(response, false);
      },
    );

    // Handle notification tapped that opened the app (cold start)
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        void handleResponse(response, true);
      }
    });

    return () => subscription.remove();
  }, [enabled]);
}
