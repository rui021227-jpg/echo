import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { getSetting, setSetting, deleteAllData } from '../../database/database';
import { scheduleDailyReminder } from '../../services/notifications';
import { pushToCloud, pullFromCloud } from '../../services/cloudSync';
import { RUNTIME_CONFIG } from '../../config';
import { useApp } from '../../state/AppContext';
import { AppScreen } from '../../components/AppScreen';
import { ReminderTimePicker } from '../../components/ReminderTimePicker';

type Props = NativeStackScreenProps<MainStackParamList, 'Settings'>;
const MINUTE_STEP = 5;
const MINUTES_PER_DAY = 24 * 60;
const MAX_HOUR = 23;
const MAX_MINUTE = 59;

function parseStoredTimePart(
  value: string | null,
  fallback: number,
  maxValue: number,
): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > maxValue) {
    return fallback;
  }

  return parsed;
}

export function SettingsScreen({ navigation }: Props) {
  const { isPremium } = useApp();
  const [hour, setHour] = useState(21);
  const [minute, setMinute] = useState(0);
  const [isLoadingReminderTime, setIsLoadingReminderTime] = useState(true);
  const [isSavingReminderTime, setIsSavingReminderTime] = useState(false);
  const [busyAction, setBusyAction] = useState<'backup' | 'restore' | 'delete' | null>(null);
  const syncEnabled = !!RUNTIME_CONFIG.supabaseCloudSyncUrl;
  const isBusy = busyAction !== null;
  const isInteractionLocked = isBusy || isSavingReminderTime;
  const isReminderDisabled = isLoadingReminderTime || isInteractionLocked;

  useEffect(() => {
    async function loadTime() {
      try {
        const [savedHour, savedMinute] = await Promise.all([
          getSetting('reminder_hour'),
          getSetting('reminder_minute'),
        ]);

        setHour(parseStoredTimePart(savedHour, 21, MAX_HOUR));
        setMinute(parseStoredTimePart(savedMinute, 0, MAX_MINUTE));
      } finally {
        setIsLoadingReminderTime(false);
      }
    }

    void loadTime();
  }, []);

  const handleBackup = async () => {
    setBusyAction('backup');
    try {
      await pushToCloud();
      Alert.alert(COPY.sync.backupSuccess);
    } catch {
      Alert.alert(COPY.sync.backupError);
    } finally {
      setBusyAction(null);
    }
  };

  const handleRestore = () => {
    Alert.alert(
      COPY.sync.confirmRestoreTitle,
      COPY.sync.confirmRestoreMessage,
      [
        { text: COPY.settings.cancel, style: 'cancel' },
        {
          text: COPY.sync.confirmRestoreButton,
          onPress: async () => {
            setBusyAction('restore');
            try {
              await pullFromCloud();
              Alert.alert(COPY.sync.restoreSuccess);
            } catch (err) {
              const message =
                err instanceof Error && err.message.includes('No backup')
                  ? COPY.sync.noBackupError
                  : COPY.sync.restoreError;
              Alert.alert(message);
            } finally {
              setBusyAction(null);
            }
          },
        },
      ],
    );
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
          onPress: async () => {
            setBusyAction('delete');
            try {
              await deleteAllData();
              Alert.alert(COPY.settings.deleteAllSuccess);
            } catch {
              Alert.alert(COPY.settings.deleteAllError);
            } finally {
              setBusyAction(null);
            }
          },
        },
      ],
    );
  };

  const saveReminderTime = async (totalMinutes: number) => {
    if (isReminderDisabled) {
      return;
    }

    const normalized =
      ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    const newHour = Math.floor(normalized / 60);
    const newMinute = normalized % 60;

    setIsSavingReminderTime(true);

    try {
      await Promise.all([
        setSetting('reminder_hour', String(newHour)),
        setSetting('reminder_minute', String(newMinute)),
      ]);
      await scheduleDailyReminder(newHour, newMinute);
      setHour(newHour);
      setMinute(newMinute);
    } catch {
      await Promise.all([
        setSetting('reminder_hour', String(hour)),
        setSetting('reminder_minute', String(minute)),
      ]).catch((rollbackError) => {
        console.error('Failed to roll back reminder settings:', rollbackError);
      });
      Alert.alert(COPY.settings.reminderSaveError);
    } finally {
      setIsSavingReminderTime(false);
    }
  };

  const adjustHour = async (delta: number) => {
    await saveReminderTime(hour * 60 + minute + delta * 60);
  };

  const adjustMinute = async (delta: number) => {
    await saveReminderTime(hour * 60 + minute + delta * MINUTE_STEP);
  };

  return (
    <AppScreen scroll contentContainerStyle={styles.container}>
      <Text style={styles.title}>{COPY.settings.title}</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.label}>{COPY.settings.reminderTime}</Text>
          {isLoadingReminderTime || isSavingReminderTime ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : null}
        </View>
        <ReminderTimePicker
          hour={hour}
          minute={minute}
          disabled={isReminderDisabled}
          onAdjustHour={(delta) => void adjustHour(delta)}
          onAdjustMinute={(delta) => void adjustMinute(delta)}
        />
      </View>

      <TouchableOpacity
        style={[styles.row, isInteractionLocked && styles.rowDisabled]}
        onPress={() => navigation.navigate('Paywall', { source: 'settings' })}
        disabled={isInteractionLocked}
        accessibilityRole="button"
        accessibilityLabel={COPY.settings.manageSubscription}
        accessibilityHint="Opens subscription management"
        accessibilityState={{ disabled: isInteractionLocked }}
      >
        <Text style={styles.rowText}>{COPY.settings.manageSubscription}</Text>
        <Text style={styles.rowValue}>
          {isPremium ? COPY.settings.premiumStatus : COPY.settings.freeStatus}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, isInteractionLocked && styles.rowDisabled]}
        onPress={() => navigation.navigate('About')}
        disabled={isInteractionLocked}
        accessibilityRole="button"
        accessibilityLabel={COPY.settings.about}
        accessibilityHint="Opens app information and privacy policy"
        accessibilityState={{ disabled: isInteractionLocked }}
      >
        <Text style={styles.rowText}>{COPY.settings.about}</Text>
      </TouchableOpacity>

      {syncEnabled && (
        <>
          <TouchableOpacity
            style={[styles.row, isInteractionLocked && styles.rowDisabled]}
            onPress={() => void handleBackup()}
            disabled={isInteractionLocked}
            accessibilityRole="button"
            accessibilityLabel={COPY.sync.backupTitle}
            accessibilityHint="Saves your local data to the cloud"
            accessibilityState={{ disabled: isInteractionLocked, busy: busyAction === 'backup' }}
          >
            <View>
              <Text style={styles.rowText}>{COPY.sync.backupTitle}</Text>
              <Text style={styles.rowSubtext}>
                {busyAction === 'backup' ? COPY.sync.backingUp : COPY.sync.backupSubtitle}
              </Text>
            </View>
            {busyAction === 'backup' ? (
              <ActivityIndicator size="small" color={COLORS.accent} />
            ) : (
              <Text style={styles.rowValue}>{COPY.settings.arrow}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.row, isInteractionLocked && styles.rowDisabled]}
            onPress={handleRestore}
            disabled={isInteractionLocked}
            accessibilityRole="button"
            accessibilityLabel={COPY.sync.restoreTitle}
            accessibilityHint="Loads your backed up data from the cloud"
            accessibilityState={{ disabled: isInteractionLocked, busy: busyAction === 'restore' }}
          >
            <View>
              <Text style={styles.rowText}>{COPY.sync.restoreTitle}</Text>
              <Text style={styles.rowSubtext}>
                {busyAction === 'restore' ? COPY.sync.restoring : COPY.sync.restoreSubtitle}
              </Text>
            </View>
            {busyAction === 'restore' ? (
              <ActivityIndicator size="small" color={COLORS.accent} />
            ) : (
              <Text style={styles.rowValue}>{COPY.settings.arrow}</Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[styles.row, styles.destructiveRow, isInteractionLocked && styles.rowDisabled]}
        onPress={handleDeleteAll}
        disabled={isInteractionLocked}
        accessibilityRole="button"
        accessibilityLabel={COPY.settings.deleteAllData}
        accessibilityHint="Permanently deletes all local check-ins and reflections"
        accessibilityState={{ disabled: isInteractionLocked, busy: busyAction === 'delete' }}
      >
        <Text style={styles.destructiveText}>{COPY.settings.deleteAllData}</Text>
        {busyAction === 'delete' ? (
          <ActivityIndicator size="small" color={COLORS.danger} />
        ) : null}
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xxxl,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
    textTransform: 'uppercase',
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
  rowSubtext: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.muted,
    marginTop: 2,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  destructiveRow: {
    marginTop: SPACING.xl,
  },
  destructiveText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.danger,
  },
});
