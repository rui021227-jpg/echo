const mockRunAsync = jest.fn();

jest.mock('../../src/database/database', () => ({
  getDatabase: () => ({
    runAsync: mockRunAsync,
  }),
}));

import {
  EntryAlreadyExistsError,
  insertEntry,
  isDuplicateEntryError,
} from '../../src/database/entries';

describe('insertEntry', () => {
  beforeEach(() => {
    mockRunAsync.mockReset();
  });

  it('uses INSERT semantics instead of replacing an existing entry', async () => {
    mockRunAsync.mockResolvedValue(undefined);

    await insertEntry('2026-03-30', 3, 'okay', true);

    expect(mockRunAsync).toHaveBeenCalledWith(
      'INSERT INTO entries (date, emoji_score, word, breath_taken) VALUES (?, ?, ?, ?)',
      '2026-03-30',
      3,
      'okay',
      1,
    );
  });

  it('throws a typed duplicate-entry error on unique constraint failures', async () => {
    mockRunAsync.mockRejectedValue(new Error('UNIQUE constraint failed: entries.date'));

    await expect(insertEntry('2026-03-30', 3, 'okay', false)).rejects.toBeInstanceOf(
      EntryAlreadyExistsError,
    );
  });

  it('recognizes duplicate-entry errors', () => {
    expect(isDuplicateEntryError(new EntryAlreadyExistsError('2026-03-30'))).toBe(
      true,
    );
    expect(isDuplicateEntryError(new Error('other'))).toBe(false);
  });
});
