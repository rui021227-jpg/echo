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

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  // Cancel existing daily notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'daily') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  // Schedule one for each day of the week with rotating copy
  const variants = COPY.notifications.dailyVariants;
  for (let weekday = 1; weekday <= 7; weekday++) {
    const variant = variants[(weekday - 1) % variants.length];
    await Notifications.scheduleNotificationAsync({
      content: {
        title: COPY.appName,
        body: variant,
        data: { type: 'daily' },
        ...(Platform.OS === 'android' && { channelId: 'daily' }),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour,
        minute,
      },
    });
  }
}

export async function scheduleSundayReflection(): Promise<void> {
  // Cancel existing Sunday notifications
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  for (const notif of scheduled) {
    if (notif.content.data?.type === 'reflection') {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: COPY.appName,
      body: COPY.notifications.sundayTitle,
      data: { type: 'reflection' },
      ...(Platform.OS === 'android' && { channelId: 'reflection' }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: 1, // Sunday
      hour: 9,
      minute: 0,
    },
  });
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
