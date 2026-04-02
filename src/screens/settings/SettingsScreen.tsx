import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { getSetting, setSetting, deleteAllData } from '../../database/database';
import { scheduleDailyReminder } from '../../services/notifications';
import { useApp } from '../../state/AppContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const { isPremium } = useApp();
  const [hour, setHour] = useState(21);
  const [minute] = useState(0);

  useEffect(() => {
    async function loadTime() {
      const h = await getSetting('reminder_hour');
      if (h) setHour(parseInt(h, 10));
    }
    loadTime();
  }, []);

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${String(m).padStart(2, '0')} ${period}`;
  };

  const handleDeleteAll = () => {
    Alert.alert(
      COPY.settings.deleteAllConfirmTitle,
      COPY.settings.deleteAllConfirmMessage,
      [
        { text: COPY.settings.cancel, style: 'cancel' },
        {
          text: COPY.settings.deleteAllConfirmButton,
          style: 'destructive',
          onPress: () => void deleteAllData(),
        },
      ],
    );
  };

  const adjustHour = async (delta: number) => {
    const newHour = (hour + delta + 24) % 24;
    setHour(newHour);
    await setSetting('reminder_hour', String(newHour));
    await scheduleDailyReminder(newHour, minute);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{COPY.settings.title}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{COPY.settings.reminderTime}</Text>
        <View style={styles.timeRow}>
          <TouchableOpacity onPress={() => adjustHour(-1)} style={styles.arrowBtn}>
            <Text style={styles.arrow}>-</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>{formatTime(hour, minute)}</Text>
          <TouchableOpacity onPress={() => adjustHour(1)} style={styles.arrowBtn}>
            <Text style={styles.arrow}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('Paywall', { source: 'settings' })}
      >
        <Text style={styles.rowText}>{COPY.settings.manageSubscription}</Text>
        <Text style={styles.rowValue}>{isPremium ? 'Premium' : 'Free'}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('About')}
      >
        <Text style={styles.rowText}>{COPY.settings.about}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.row, styles.destructiveRow]} onPress={handleDeleteAll}>
        <Text style={styles.destructiveText}>{COPY.settings.deleteAllData}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  arrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '600',
  },
  timeText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '600',
  },
  row: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  rowValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
  },
  destructiveRow: {
    marginTop: SPACING.xl,
  },
  destructiveText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.danger,
  },
});
