import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { getOfferings, purchasePackage, restorePurchases } from '../../services/purchases';
import { useApp } from '../../state/AppContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Paywall'>;

export function PaywallScreen({ navigation, route }: Props) {
  const { source, weekStart } = route.params;
  const { refreshPremium } = useApp();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOfferings() {
      const currentOffering = await getOfferings();
      if (!active) return;

      setOffering(currentOffering);
      setError(
        currentOffering && currentOffering.availablePackages.length > 0
          ? null
          : COPY.paywall.unavailable,
      );
      setLoading(false);
    }

    void loadOfferings();

    return () => {
      active = false;
    };
  }, []);

  const handleSuccess = async () => {
    await refreshPremium();

    if (source === 'reflection' && weekStart) {
      navigation.replace('ReflectionCard', { weekStart });
      return;
    }

    navigation.goBack();
  };

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    setError(null);
    const success = await purchasePackage(pkg);
    if (success) {
      await handleSuccess();
    } else {
      setError(COPY.paywall.purchaseError);
    }
    setPurchasing(false);
  };

  const handleRestore = async () => {
    setPurchasing(true);
    setError(null);
    const success = await restorePurchases();
    if (success) {
      await handleSuccess();
    } else {
      setError(COPY.paywall.purchaseError);
    }
    setPurchasing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={COLORS.accent} size="large" />
      </View>
    );
  }

  const monthlyPkg = offering?.availablePackages.find(
    (p) => p.packageType === 'MONTHLY',
  );
  const annualPkg = offering?.availablePackages.find(
    (p) => p.packageType === 'ANNUAL',
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{COPY.paywall.title}</Text>

      <View style={styles.features}>
        {COPY.paywall.features.map((f) => (
          <Text key={f} style={styles.feature}>
            • {f}
          </Text>
        ))}
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>{error}</Text>
          <Text style={styles.errorBody}>{COPY.paywall.unavailableDetail}</Text>
        </View>
      ) : null}

      <View style={styles.packages}>
        {annualPkg && (
          <TouchableOpacity
            style={[styles.packageButton, styles.annualButton]}
            onPress={() => handlePurchase(annualPkg)}
            disabled={purchasing}
          >
            <Text style={styles.packageLabel}>{COPY.paywall.yearlyLabel}</Text>
            <Text style={styles.packagePrice}>{annualPkg.product.priceString}</Text>
            <Text style={styles.savings}>{COPY.paywall.yearlySavings}</Text>
          </TouchableOpacity>
        )}

        {monthlyPkg && (
          <TouchableOpacity
            style={styles.packageButton}
            onPress={() => handlePurchase(monthlyPkg)}
            disabled={purchasing}
          >
            <Text style={styles.packageLabel}>{COPY.paywall.monthlyLabel}</Text>
            <Text style={styles.packagePrice}>{monthlyPkg.product.priceString}</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity onPress={handleRestore} disabled={purchasing}>
        <Text style={styles.restoreText}>{COPY.paywall.restore}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeText}>{COPY.paywall.maybeLater}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  features: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  feature: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  errorCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  errorTitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  errorBody: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  packages: {
    width: '100%',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  packageButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  annualButton: {
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  packageLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  packagePrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  savings: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    marginTop: SPACING.xs,
  },
  restoreText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
    marginBottom: SPACING.lg,
  },
  closeButton: {
    padding: SPACING.md,
  },
  closeText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.muted,
  },
});
