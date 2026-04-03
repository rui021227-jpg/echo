import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { COPY } from '../constants/copy';
import { getWeekStart } from '../utils/dateHelpers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications(): Promise<boolean> {
  if (!Device.isDevice) {
    console.warn('Push notifications require a physical device');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('daily', {
      name: 'Daily Check-in',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
    await Notifications.setNotificationChannelAsync('reflection', {
      name: 'Weekly Reflection',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return true;
}

async function replaceScheduledNotifications(
  type: NotificationType,
  requests: Array<Parameters<typeof Notifications.scheduleNotificationAsync>[0]>,
): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const existingIds = scheduled
    .filter((notif) => notif.content.data?.type === type)
    .map((notif) => notif.identifier);

  const newIds: string[] = [];

  try {
    for (const request of requests) {
      const identifier = await Notifications.scheduleNotificationAsync(request);
      newIds.push(identifier);
    }
  } catch (error) {
    await Promise.all(
      newIds.map((identifier) =>
        Notifications.cancelScheduledNotificationAsync(identifier),
      ),
    );
    throw error;
  }

  await Promise.all(
    existingIds.map((identifier) =>
      Notifications.cancelScheduledNotificationAsync(identifier),
    ),
  );
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  const variants = COPY.notifications.dailyVariants;
  const requests: Array<Parameters<typeof Notifications.scheduleNotificationAsync>[0]> = [];

  for (let weekday = 1; weekday <= 7; weekday += 1) {
    const variant = variants[(weekday - 1) % variants.length];
    requests.push({
      content: {
        title: COPY.appName,
        body: variant,
        data: { type: 'daily' },
        ...(Platform.OS === 'android' && { channelId: 'daily' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY as const,
        weekday,
        hour,
        minute,
      },
    });
  }

  await replaceScheduledNotifications('daily', requests);
}

export async function scheduleSundayReflection(): Promise<void> {
  await replaceScheduledNotifications('reflection', [
    {
      content: {
        title: COPY.appName,
        body: COPY.notifications.sundayTitle,
        data: { type: 'reflection' },
        ...(Platform.OS === 'android' && { channelId: 'reflection' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY as const,
        weekday: 1, // Sunday
        hour: 9,
        minute: 0,
      },
    },
  ]);
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export type NotificationType = 'daily' | 'reflection';

export function getNotificationResponseId(
  response: Notifications.NotificationResponse,
): string {
  return `${response.notification.request.identifier}:${response.actionIdentifier}`;
}

export function getReflectionWeekStart(
  data: Record<string, unknown>,
  now: Date = new Date(),
): string {
  const weekStart = data.weekStart;
  if (typeof weekStart === 'string' && weekStart.length > 0) {
    return weekStart;
  }

  return getWeekStart(now);
}

export function getNotificationType(
  response: Notifications.NotificationResponse,
): NotificationType {
  const type = response.notification.request.content.data?.type;
  return type === 'reflection' ? 'reflection' : 'daily';
}

export function shouldHandleNotificationResponse(
  lastHandledResponseId: string | null,
  response: Notifications.NotificationResponse,
): boolean {
  return getNotificationResponseId(response) !== lastHandledResponseId;
}
