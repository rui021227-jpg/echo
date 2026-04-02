import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { BreathingAnimation } from '../../components/BreathingAnimation';
import { insertEntry, isDuplicateEntryError } from '../../database/entries';
import type { EmojiScore } from '../../types/entry';
import { useApp } from '../../state/AppContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Breathing'>;

const BREATHING_DURATION_MS = 60_000;
const SKIP_MESSAGE_DURATION_MS = 1500;

export function BreathingScreen({ navigation, route }: Props) {
  const { emojiScore, word, date } = route.params;
  const { secondsRemaining, isTimedSessionActive } = useApp();
  const [showSkipMessage, setShowSkipMessage] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPendingTimeouts = useCallback(() => {
    if (skipTimeoutRef.current) {
      clearTimeout(skipTimeoutRef.current);
      skipTimeoutRef.current = null;
    }

    if (breathingTimeoutRef.current) {
      clearTimeout(breathingTimeoutRef.current);
      breathingTimeoutRef.current = null;
    }
  }, []);

  const saveAndNavigate = useCallback(
    async (breathTaken: boolean) => {
      clearPendingTimeouts();

      try {
        await insertEntry(date, emojiScore as EmojiScore, word, breathTaken);
        navigation.navigate('Completion');
      } catch (entryError) {
        if (isDuplicateEntryError(entryError)) {
          navigation.navigate('Completion');
          return;
        }

        console.error('Failed to save entry:', entryError);
        setError(COPY.daily.saveError);
      }
    },
    [clearPendingTimeouts, date, emojiScore, navigation, word],
  );

  const handleSkip = () => {
    setShowSkipMessage(true);
    skipTimeoutRef.current = setTimeout(() => {
      void saveAndNavigate(false);
    }, SKIP_MESSAGE_DURATION_MS);
  };

  const handleStartBreathing = () => {
    setBreathing(true);
  };

  useEffect(() => {
    if (!breathing) return;
    breathingTimeoutRef.current = setTimeout(() => {
      void saveAndNavigate(true);
    }, BREATHING_DURATION_MS);

    return () => {
      if (breathingTimeoutRef.current) {
        clearTimeout(breathingTimeoutRef.current);
        breathingTimeoutRef.current = null;
      }
    };
  }, [breathing, saveAndNavigate]);

  useEffect(() => () => clearPendingTimeouts(), [clearPendingTimeouts]);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (showSkipMessage) {
    return (
      <View style={styles.container}>
        {isTimedSessionActive ? (
          <Text style={styles.timer}>{secondsRemaining}s</Text>
        ) : null}
        <Text style={styles.skipMessage}>{COPY.daily.breathSkipMessage}</Text>
      </View>
    );
  }

  if (breathing) {
    return (
      <View style={styles.container}>
        {isTimedSessionActive ? (
          <Text style={styles.timer}>{secondsRemaining}s</Text>
        ) : null}
        <BreathingAnimation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isTimedSessionActive ? (
        <Text style={styles.timer}>{secondsRemaining}s</Text>
      ) : null}

      <TouchableOpacity onPress={handleStartBreathing}>
        <Text style={styles.prompt}>{COPY.daily.breathPrompt}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
        <Text style={styles.skipText}>{COPY.daily.breathSkip}</Text>
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
  prompt: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
    fontWeight: '300',
    marginBottom: SPACING.xxl,
  },
  timer: {
    position: 'absolute',
    top: SPACING.xxxl,
    right: SPACING.xl,
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
  },
  skipButton: {
    marginTop: SPACING.xl,
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.muted,
  },
  skipMessage: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.secondary,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});
