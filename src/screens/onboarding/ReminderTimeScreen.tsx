import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { scheduleDailyReminder, scheduleSundayReflection } from '../../services/notifications';
import { getSetting, setSetting } from '../../database/database';
import { ReminderTimePicker } from '../../components/ReminderTimePicker';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ReminderTime'>;
const MINUTE_STEP = 5;
const MINUTES_PER_DAY = 24 * 60;

export function ReminderTimeScreen({ navigation }: Props) {
  const [hour, setHour] = useState(21);
  const [minute, setMinute] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const updateLocalTime = (totalMinutes: number) => {
    const normalized = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    setHour(Math.floor(normalized / 60));
    setMinute(normalized % 60);
  };

  const adjustHour = (delta: number) => {
    updateLocalTime(hour * 60 + minute + delta * 60);
  };

  const adjustMinute = (delta: number) => {
    updateLocalTime(hour * 60 + minute + delta * MINUTE_STEP);
  };

  const handleSet = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    let previousHour: string | null = null;
    let previousMinute: string | null = null;

    try {
      [previousHour, previousMinute] = await Promise.all([
        getSetting('reminder_hour'),
        getSetting('reminder_minute'),
      ]);

      await Promise.all([
        setSetting('reminder_hour', String(hour)),
        setSetting('reminder_minute', String(minute)),
      ]);
      await scheduleDailyReminder(hour, minute);
      await scheduleSundayReflection();
      navigation.navigate('OnboardingEmojiPicker');
    } catch {
      await Promise.all([
        setSetting('reminder_hour', previousHour ?? '21'),
        setSetting('reminder_minute', previousMinute ?? '0'),
      ])
        .catch((rollbackError) => {
          console.error('Failed to roll back onboarding reminder settings:', rollbackError);
        });
      Alert.alert(COPY.onboarding.reminderError);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ReminderTimePicker
          hour={hour}
          minute={minute}
          onAdjustHour={adjustHour}
          onAdjustMinute={adjustMinute}
          disabled={isSaving}
        />
        <Text style={styles.subtitle}>{COPY.onboarding.reminderTitle}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={handleSet}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={styles.buttonText}>{COPY.onboarding.setReminder}</Text>
        )}
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
    width: '100%',
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.secondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
});
