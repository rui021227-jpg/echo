import { buildPayload } from '../../src/services/reflection';
import type { Entry } from '../../src/types/entry';

const makeEntry = (overrides: Partial<Entry> = {}): Entry => ({
  id: 1,
  date: '2026-03-23',
  emoji_score: 3,
  word: 'okay',
  breath_taken: false,
  created_at: '2026-03-23T20:00:00',
  ...overrides,
});

describe('buildPayload', () => {
  it('builds a payload with correct structure', () => {
    const entries: Entry[] = [
      makeEntry({ date: '2026-03-23', emoji_score: 3, word: 'tired', breath_taken: false }),
      makeEntry({ date: '2026-03-25', emoji_score: 4, word: 'grateful', breath_taken: true }),
    ];

    const payload = buildPayload('2026-03-23', entries);

    expect(payload.week_start).toBe('2026-03-23');
    expect(payload.entry_count).toBe(2);
    expect(payload.emoji_scale).toBe('1=lowest 5=highest');
    expect(payload.entries).toHaveLength(2);
    expect(payload.entries[0]).toMatchObject({
      day: 'Mon',
      emoji_score: 3,
      word: 'tired',
      breath: false,
    });
    expect(payload.entries[1]).toMatchObject({
      day: 'Wed',
      emoji_score: 4,
      word: 'grateful',
      breath: true,
    });
  });

  it('includes correct day names', () => {
    const entries: Entry[] = [
      makeEntry({ date: '2026-03-24', word: 'calm' }),  // Tuesday
      makeEntry({ date: '2026-03-27', word: 'good' }),  // Friday
      makeEntry({ date: '2026-03-29', word: 'rested' }), // Sunday
    ];

    const payload = buildPayload('2026-03-23', entries);

    expect(payload.entries[0].day).toBe('Tue');
    expect(payload.entries[1].day).toBe('Fri');
    expect(payload.entries[2].day).toBe('Sun');
  });

  it('handles single entry', () => {
    const entries = [makeEntry({ emoji_score: 5, word: 'great' })];
    const payload = buildPayload('2026-03-23', entries);
    expect(payload.entry_count).toBe(1);
    expect(payload.entries[0].emoji_score).toBe(5);
  });
});
