const mockGetSetting = jest.fn();
const mockSetSetting = jest.fn();
const mockGetAllEntries = jest.fn();
const mockMergeEntries = jest.fn();
const mockGetAllReflections = jest.fn();
const mockMergeReflection = jest.fn();
const mockWarnMissingRuntimeConfig = jest.fn();

jest.mock('../../src/database/database', () => ({
  getSetting: (...args: unknown[]) => mockGetSetting(...args),
  setSetting: (...args: unknown[]) => mockSetSetting(...args),
}));

jest.mock('../../src/database/entries', () => ({
  getAllEntries: (...args: unknown[]) => mockGetAllEntries(...args),
  mergeEntries: (...args: unknown[]) => mockMergeEntries(...args),
}));

jest.mock('../../src/database/reflections', () => ({
  getAllReflections: (...args: unknown[]) => mockGetAllReflections(...args),
  mergeReflection: (...args: unknown[]) => mockMergeReflection(...args),
}));

jest.mock('../../src/config', () => ({
  RUNTIME_CONFIG: {
    supabaseCloudSyncUrl: 'https://example.test/functions/v1/cloud-sync',
  },
  warnMissingRuntimeConfig: mockWarnMissingRuntimeConfig,
}));

import { pullFromCloud } from '../../src/services/cloudSync';

describe('pullFromCloud', () => {
  beforeEach(() => {
    mockGetSetting.mockReset();
    mockSetSetting.mockReset();
    mockGetAllEntries.mockReset();
    mockMergeEntries.mockReset();
    mockGetAllReflections.mockReset();
    mockMergeReflection.mockReset();
    mockWarnMissingRuntimeConfig.mockReset();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  it('merges restored records instead of replacing local data', async () => {
    mockGetSetting.mockResolvedValue('123e4567-e89b-12d3-a456-426614174000');
    mockMergeEntries.mockResolvedValue(1);
    mockMergeReflection.mockResolvedValue(true);
    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        entries: [
          {
            date: '2026-03-30',
            emoji_score: 3,
            word: 'okay',
            breath_taken: true,
            created_at: '2026-03-30T10:00:00.000Z',
          },
        ],
        reflections: [
          {
            week_start: '2026-03-23',
            s1: 'A steady week.',
            s2: 'You found a rhythm.',
            s3: 'That quiet consistency mattered.',
            avatar_key: 'cloudy',
            is_crisis: false,
            created_at: '2026-03-29T09:00:00.000Z',
          },
        ],
      }),
    });

    await expect(pullFromCloud()).resolves.toEqual({ entries: 1, reflections: 1 });

    expect(mockMergeEntries).toHaveBeenCalledWith([
      {
        id: 0,
        date: '2026-03-30',
        emoji_score: 3,
        word: 'okay',
        breath_taken: true,
        created_at: '2026-03-30T10:00:00.000Z',
      },
    ]);
    expect(mockMergeReflection).toHaveBeenCalledWith(
      '2026-03-23',
      'A steady week.',
      'You found a rhythm.',
      'That quiet consistency mattered.',
      'cloudy',
      false,
      '2026-03-29T09:00:00.000Z',
    );
  });

  it('fails fast when there is no registered cloud backup for this device', async () => {
    mockGetSetting.mockResolvedValue(null);

    await expect(pullFromCloud()).rejects.toThrow(
      'No backup found. Back up first to enable restore.',
    );

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('maps a missing remote device backup to the no-backup error', async () => {
    mockGetSetting.mockResolvedValue('123e4567-e89b-12d3-a456-426614174000');
    (global.fetch as unknown as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(pullFromCloud()).rejects.toThrow(
      'No backup found. Back up first to enable restore.',
    );

    expect(mockMergeEntries).not.toHaveBeenCalled();
    expect(mockMergeReflection).not.toHaveBeenCalled();
  });
});
