import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import * as Localization from 'expo-localization';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CRISIS_CARD_TEXT, getCrisisLine, getCrisisPhone } from '../../constants/crisis';

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
      <View style={styles.card}>
        <Text style={styles.message}>{CRISIS_CARD_TEXT}</Text>

        <TouchableOpacity onPress={handleCall} style={styles.phoneContainer}>
          <Text style={styles.phoneLine}>{crisisLine}</Text>
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
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
  },
  message: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    lineHeight: 28,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  phoneContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  phoneLine: {
    fontSize: FONT_SIZES.md,
    color: COLORS.accent,
    textAlign: 'center',
    fontWeight: '600',
  },
});
