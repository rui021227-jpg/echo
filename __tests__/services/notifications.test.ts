import * as Notifications from 'expo-notifications';
import {
  scheduleDailyReminder,
  getNotificationResponseId,
  getReflectionWeekStart,
  shouldHandleNotificationResponse,
} from '../../src/services/notifications';

function makeResponse(identifier: string, actionIdentifier = 'tap') {
  return {
    actionIdentifier,
    notification: {
      request: {
        identifier,
        content: {
          data: { type: 'daily' },
        },
      },
    },
  } as any;
}

describe('getReflectionWeekStart', () => {
  it('returns the payload weekStart when present', () => {
    expect(
      getReflectionWeekStart({ weekStart: '2026-03-23' }, new Date('2026-03-30')),
    ).toBe('2026-03-23');
  });

  it('falls back to the current week when the payload is missing weekStart', () => {
    expect(
      getReflectionWeekStart({}, new Date('2026-03-30T09:00:00.000Z')),
    ).toBe('2026-03-30');
  });
});

describe('notification response helpers', () => {
  it('builds a stable response id from the notification request id and action id', () => {
    expect(getNotificationResponseId(makeResponse('notif-1', 'default'))).toBe(
      'notif-1:default',
    );
  });

  it('skips a notification response when it matches the last handled id', () => {
    const response = makeResponse('notif-1');
    expect(shouldHandleNotificationResponse('notif-1:tap', response)).toBe(false);
  });

  it('handles a notification response when it differs from the last handled id', () => {
    const response = makeResponse('notif-2');
    expect(shouldHandleNotificationResponse('notif-1:tap', response)).toBe(true);
  });
});

describe('scheduleDailyReminder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('replaces the previous daily schedule only after the new one is in place', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      {
        identifier: 'old-daily',
        content: { data: { type: 'daily' } },
      },
    ]);
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce('new-1')
      .mockResolvedValueOnce('new-2')
      .mockResolvedValueOnce('new-3')
      .mockResolvedValueOnce('new-4')
      .mockResolvedValueOnce('new-5')
      .mockResolvedValueOnce('new-6')
      .mockResolvedValueOnce('new-7');

    await scheduleDailyReminder(21, 0);

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(7);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-daily');

    const cancelOrder = (Notifications.cancelScheduledNotificationAsync as jest.Mock)
      .mock.invocationCallOrder[0];
    const finalScheduleOrder = (Notifications.scheduleNotificationAsync as jest.Mock)
      .mock.invocationCallOrder[6];

    expect(cancelOrder).toBeGreaterThan(finalScheduleOrder);
  });

  it('rolls back newly scheduled reminders if replacement fails mid-flight', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      {
        identifier: 'old-daily',
        content: { data: { type: 'daily' } },
      },
    ]);
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce('new-1')
      .mockRejectedValueOnce(new Error('schedule failed'));

    await expect(scheduleDailyReminder(21, 0)).rejects.toThrow('schedule failed');

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('new-1');
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('old-daily');
  });
});
