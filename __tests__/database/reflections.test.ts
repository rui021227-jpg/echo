const mockRunAsync = jest.fn();

jest.mock('../../src/database/database', () => ({
  getDatabase: () => ({
    runAsync: mockRunAsync,
  }),
}));

import { mergeReflection } from '../../src/database/reflections';

describe('mergeReflection', () => {
  beforeEach(() => {
    mockRunAsync.mockReset();
  });

  it('merges a restored reflection without overwriting an existing week', async () => {
    mockRunAsync.mockResolvedValue({ changes: 1 });

    const inserted = await mergeReflection(
      '2026-03-23',
      'A steady week.',
      'You found a rhythm.',
      'That quiet consistency mattered.',
      'cloudy',
      false,
      '2026-03-29T09:00:00.000Z',
    );

    expect(inserted).toBe(true);
    expect(mockRunAsync).toHaveBeenCalledWith(
      'INSERT OR IGNORE INTO reflections (week_start, s1, s2, s3, avatar_key, is_crisis, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      '2026-03-23',
      'A steady week.',
      'You found a rhythm.',
      'That quiet consistency mattered.',
      'cloudy',
      0,
      '2026-03-29T09:00:00.000Z',
    );
  });
});
