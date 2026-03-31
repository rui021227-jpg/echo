import { bootstrapApp } from '../../src/store/bootstrap';

describe('bootstrapApp', () => {
  it('returns onboarding status and treats purchases as non-critical', async () => {
    const onPurchasesError = jest.fn();

    await expect(
      bootstrapApp({
        initDatabase: jest.fn().mockResolvedValue(undefined) as any,
        getSetting: jest.fn().mockResolvedValue('1') as any,
        initPurchases: jest.fn(() => {
          throw new Error('RevenueCat unavailable');
        }) as any,
        refreshPremium: jest.fn().mockResolvedValue(undefined),
        onPurchasesError,
      }),
    ).resolves.toEqual({
      onboardingComplete: true,
    });

    expect(onPurchasesError).toHaveBeenCalledTimes(1);
  });

  it('rejects when database initialization fails', async () => {
    await expect(
      bootstrapApp({
        initDatabase: jest.fn().mockRejectedValue(new Error('DB failed')) as any,
        getSetting: jest.fn() as any,
        initPurchases: jest.fn() as any,
        refreshPremium: jest.fn().mockResolvedValue(undefined),
      }),
    ).rejects.toThrow('DB failed');
  });
});
