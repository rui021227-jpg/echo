import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { scheduleDailyReminder, scheduleSundayReflection } from '../../services/notifications';
import { setSetting } from '../../db/database';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ReminderTime'>;

export function ReminderTimeScreen({ navigation }: Props) {
  const [hour, setHour] = useState(21);
  const [minute] = useState(0);

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
  };

  const adjustHour = (delta: number) => {
    setHour((prev) => ((prev + delta + 24) % 24));
  };

  const handleSet = async () => {
    await setSetting('reminder_hour', String(hour));
    await setSetting('reminder_minute', String(minute));
    await scheduleDailyReminder(hour, minute);
    await scheduleSundayReflection();
    navigation.navigate('OnboardingEmojiPicker');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.timePickerRow}>
          <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.arrowBtn}>
            <Text style={styles.arrow}>-</Text>
          </TouchableOpacity>
          <Text style={styles.time}>{formatTime(hour, minute)}</Text>
          <TouchableOpacity onPress={() => adjustHour(1)} style={styles.arrowBtn}>
            <Text style={styles.arrow}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>{COPY.onboarding.reminderTitle}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSet}>
        <Text style={styles.buttonText}>{COPY.onboarding.setReminder}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  arrowBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '600',
  },
  time: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '600',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
});
