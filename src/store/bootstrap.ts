import { getSetting, initDatabase } from '../db/database';
import { initPurchases } from '../services/purchases';

export interface BootstrapDependencies {
  initDatabase: typeof initDatabase;
  getSetting: typeof getSetting;
  initPurchases: typeof initPurchases;
  refreshPremium: () => Promise<void>;
  onPurchasesError?: (error: unknown) => void;
}

export interface BootstrapResult {
  onboardingComplete: boolean;
}

export async function bootstrapApp({
  initDatabase: initDatabaseFn,
  getSetting: getSettingFn,
  initPurchases: initPurchasesFn,
  refreshPremium,
  onPurchasesError,
}: BootstrapDependencies): Promise<BootstrapResult> {
  await initDatabaseFn();
  const onboarded = await getSettingFn('onboarding_complete');

  try {
    initPurchasesFn();
    await refreshPremium();
  } catch (error) {
    onPurchasesError?.(error);
  }

  return {
    onboardingComplete: onboarded === '1',
  };
}
