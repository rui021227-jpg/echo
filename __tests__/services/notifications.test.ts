import {
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
