import {
  formatDate,
  getWeekStart,
  getDayName,
  isSunday,
  getWeekDates,
} from '../../src/utils/dateHelpers';

describe('formatDate', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(formatDate(new Date('2026-03-30T12:00:00Z'))).toBe('2026-03-30');
  });

  it('pads single-digit month and day', () => {
    expect(formatDate(new Date('2026-01-05T12:00:00Z'))).toBe('2026-01-05');
  });
});

describe('getWeekStart', () => {
  it('returns Monday for a Wednesday', () => {
    // 2026-03-25 is a Wednesday; Monday should be 2026-03-23
    expect(getWeekStart(new Date('2026-03-25T12:00:00'))).toBe('2026-03-23');
  });

  it('returns Monday for a Monday', () => {
    expect(getWeekStart(new Date('2026-03-23T12:00:00'))).toBe('2026-03-23');
  });

  it('returns Monday for a Sunday (previous Monday)', () => {
    // 2026-03-29 is a Sunday; previous Monday is 2026-03-23
    expect(getWeekStart(new Date('2026-03-29T12:00:00'))).toBe('2026-03-23');
  });

  it('handles month boundary', () => {
    // 2026-03-02 is a Monday
    expect(getWeekStart(new Date('2026-03-04T12:00:00'))).toBe('2026-03-02');
  });

  it('handles year boundary', () => {
    // 2026-01-01 is a Thursday; Monday is 2025-12-29
    expect(getWeekStart(new Date('2026-01-01T12:00:00'))).toBe('2025-12-29');
  });
});

describe('getDayName', () => {
  it('returns Mon for a Monday', () => {
    expect(getDayName('2026-03-23')).toBe('Mon');
  });

  it('returns Sun for a Sunday', () => {
    expect(getDayName('2026-03-29')).toBe('Sun');
  });

  it('returns Fri for a Friday', () => {
    expect(getDayName('2026-03-27')).toBe('Fri');
  });
});

describe('isSunday', () => {
  it('returns true for a Sunday', () => {
    expect(isSunday(new Date('2026-03-29T12:00:00'))).toBe(true);
  });

  it('returns false for a Monday', () => {
    expect(isSunday(new Date('2026-03-23T12:00:00'))).toBe(false);
  });
});

describe('getWeekDates', () => {
  it('returns 7 dates starting from Monday', () => {
    const dates = getWeekDates('2026-03-23');
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe('2026-03-23');
    expect(dates[6]).toBe('2026-03-29');
  });

  it('handles month-spanning weeks', () => {
    const dates = getWeekDates('2026-03-30');
    expect(dates[0]).toBe('2026-03-30');
    expect(dates[2]).toBe('2026-04-01');
    expect(dates[6]).toBe('2026-04-05');
  });
});
