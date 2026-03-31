import { startSessionTimer, SESSION_DURATION_SECONDS } from '../../src/services/timer';

jest.useFakeTimers();

describe('startSessionTimer', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('exports SESSION_DURATION_SECONDS as 180', () => {
    expect(SESSION_DURATION_SECONDS).toBe(180);
  });

  it('calls onExpire after 180 seconds', () => {
    const onExpire = jest.fn();
    startSessionTimer(onExpire);
    expect(onExpire).not.toHaveBeenCalled();
    jest.advanceTimersByTime(180_000);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('does not call onExpire before 180 seconds', () => {
    const onExpire = jest.fn();
    startSessionTimer(onExpire);
    jest.advanceTimersByTime(179_999);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('clear() prevents onExpire from firing', () => {
    const onExpire = jest.fn();
    const timer = startSessionTimer(onExpire);
    jest.advanceTimersByTime(100_000);
    timer.clear();
    jest.advanceTimersByTime(100_000);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('getRemainingMs() returns a positive number before expiry', () => {
    const onExpire = jest.fn();
    const timer = startSessionTimer(onExpire);
    jest.advanceTimersByTime(60_000);
    const remaining = timer.getRemainingMs();
    // Should be approximately 120_000ms (within 100ms margin for test timing)
    expect(remaining).toBeGreaterThan(119_000);
    expect(remaining).toBeLessThanOrEqual(120_000);
  });

  it('getRemainingMs() returns 0 at or after expiry', () => {
    const onExpire = jest.fn();
    const timer = startSessionTimer(onExpire);
    jest.advanceTimersByTime(180_000);
    expect(timer.getRemainingMs()).toBe(0);
  });
});
