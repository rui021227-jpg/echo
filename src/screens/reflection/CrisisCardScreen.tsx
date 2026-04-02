import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import * as Localization from 'expo-localization';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { getCrisisLine, getCrisisPhone } from '../../constants/crisis';

type Props = NativeStackScreenProps<MainStackParamList, 'CrisisCard'>;

export function CrisisCardScreen({}: Props) {
  const locale = Localization.getLocales()[0]?.languageTag ?? 'en';
  const crisisLine = getCrisisLine(locale);
  const crisisPhone = getCrisisPhone(locale);

  const handleCall = () => {
    Linking.openURL(`tel:${crisisPhone}`);
  };

  return (
    <View style={styles.container}>
      {/* Soft background glow */}
      <View style={styles.glow} />

      <View style={styles.card}>
        {/* Visual anchor */}
        <Text style={styles.anchor}>{COPY.crisis.anchor}</Text>

        <Text style={styles.heading}>{COPY.crisis.heading}</Text>
        <Text style={styles.subheading}>{COPY.crisis.subheading}</Text>

        <View style={styles.divider} />

        <Text style={styles.callPrompt}>{COPY.crisis.callPrompt}</Text>

        <Text style={styles.crisisLineText}>{crisisLine}</Text>

        <TouchableOpacity onPress={handleCall} style={styles.callButton} activeOpacity={0.8}>
          <Text style={styles.callButtonText}>{COPY.crisis.callButton}</Text>
        </TouchableOpacity>
      </View>
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
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(90,100,180,0.08)',
    top: '25%',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(90,100,200,0.18)',
  },
  anchor: {
    fontSize: FONT_SIZES.xxxl,
    marginBottom: SPACING.md,
  },
  heading: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    lineHeight: 28,
  },
  subheading: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    width: '60%',
    backgroundColor: 'rgba(90,100,200,0.15)',
    marginBottom: SPACING.lg,
  },
  callPrompt: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
    textAlign: 'center',
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
  },
  crisisLineText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  callButton: {
    backgroundColor: 'rgba(90,100,200,0.22)',
    borderRadius: BORDER_RADIUS.full,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderWidth: 1,
    borderColor: 'rgba(90,100,220,0.4)',
  },
  callButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
