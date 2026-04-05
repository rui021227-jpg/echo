import React, { useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { insertEntry, isDuplicateEntryError } from '../../database/entries';
import type { EmojiScore } from '../../types/entry';
import { useApp } from '../../state/AppContext';
import { BreathingStep } from '../../components/BreathingStep';

const S = {
  bg: '#fcf9f1',
  surface: '#ffffff',
  green: '#586a48',
  cream: '#ffdcc4',
  peach: '#ffcf93',
  textMain: '#1c1c17',
  textMuted: '#9e9e8e',
  textSecondary: '#6b6b5e',
  progressTrack: 'rgba(88,106,72,0.15)',
};

type Props = NativeStackScreenProps<MainStackParamList, 'Breathing'>;

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return isoDate;
  }
}

export function BreathingScreen({ navigation, route }: Props) {
  const { emojiScore, word, date } = route.params;
  const { secondsRemaining, isTimedSessionActive } = useApp();

  const handleComplete = useCallback(
    async (breathTaken: boolean) => {
      try {
        await insertEntry(date, emojiScore as EmojiScore, word, breathTaken);
      } catch (entryError) {
        if (!isDuplicateEntryError(entryError)) {
          console.error('Failed to save entry:', entryError);
          throw entryError;
        }
      }
      navigation.navigate('Completion');
    },
    [date, emojiScore, navigation, word],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>Sanctuary</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.gearIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Date */}
      <Text style={styles.date}>{formatDate(date)}</Text>

      {/* Headline */}
      <Text style={styles.headline}>OneMinute</Text>
      <Text style={styles.subheadline}>just for now</Text>

      {/* Breathing step — contains animation + skip */}
      <View style={styles.breathArea}>
        <BreathingStep
          secondsRemaining={secondsRemaining}
          isTimedSessionActive={isTimedSessionActive}
          onComplete={handleComplete}
        />
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionLine}>inhale through the nose</Text>
        <Text style={styles.instructionLine}>exhale through the mouth</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressBlock}>
        <Text style={styles.progressLabel}>Step 3 of 4</Text>
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        A simple moment of presence. No streaks. No goals.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: S.bg,
    paddingHorizontal: 28,
    paddingBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 6,
  },
  logo: {
    fontSize: 18,
    fontWeight: '600',
    color: S.green,
    letterSpacing: 0.3,
  },
  gearIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  date: {
    fontSize: 13,
    color: S.textMuted,
    marginBottom: 4,
  },
  headline: {
    fontSize: 42,
    fontWeight: '700',
    color: S.textMain,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  subheadline: {
    fontSize: 14,
    fontStyle: 'italic',
    color: S.textMuted,
    marginBottom: 8,
  },
  breathArea: {
    flex: 1,
  },
  instructions: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 20,
  },
  instructionLine: {
    fontSize: 13,
    fontStyle: 'italic',
    color: S.textMuted,
    textAlign: 'center',
  },
  progressBlock: {
    gap: 6,
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 12,
    color: S.textMuted,
  },
  progressTrack: {
    height: 3,
    backgroundColor: S.progressTrack,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: S.green,
    borderRadius: 2,
  },
  footer: {
    fontSize: 11,
    fontStyle: 'italic',
    color: S.textMuted,
    textAlign: 'center',
  },
});
