import Purchases, {
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { RUNTIME_CONFIG, warnMissingRuntimeConfig } from '../config';

const ENTITLEMENT_ID = 'premium';
let purchasesConfigured = false;

function getRevenueCatApiKey(): string | undefined {
  return Platform.OS === 'ios'
    ? RUNTIME_CONFIG.revenueCatIosKey
    : RUNTIME_CONFIG.revenueCatAndroidKey;
}

function ensurePurchasesConfigured(): boolean {
  if (purchasesConfigured) {
    return true;
  }

  const apiKey = getRevenueCatApiKey();
  if (!apiKey) {
    warnMissingRuntimeConfig(
      Platform.OS === 'ios' ? 'revenueCatIosKey' : 'revenueCatAndroidKey',
      'RevenueCat is disabled until the platform API key is set.',
    );
    return false;
  }

  Purchases.configure({ apiKey });
  purchasesConfigured = true;
  return true;
}

export function initPurchases(): void {
  ensurePurchasesConfigured();
}

export async function checkEntitlement(): Promise<boolean> {
  if (!ensurePurchasesConfigured()) {
    return false;
  }

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!ensurePurchasesConfigured()) {
    return null;
  }

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchasePackage(
  pkg: PurchasesPackage,
): Promise<boolean> {
  if (!ensurePurchasesConfigured()) {
    return false;
  }

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}

export async function restorePurchases(): Promise<boolean> {
  if (!ensurePurchasesConfigured()) {
    return false;
  }

  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  } catch {
    return false;
  }
}
