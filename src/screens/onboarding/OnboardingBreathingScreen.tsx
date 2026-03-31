import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { BreathingAnimation } from '../../components/BreathingAnimation';
import { insertEntry, isDuplicateEntryError } from '../../db/entries';
import type { EmojiScore } from '../../types/entry';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingBreathing'>;

const BREATHING_DURATION_MS = 60_000;
const SKIP_MESSAGE_DURATION_MS = 1500;

export function OnboardingBreathingScreen({ navigation, route }: Props) {
  const { emojiScore, word, date } = route.params;
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
        navigation.navigate('OnboardingCompletion');
      } catch (entryError) {
        if (isDuplicateEntryError(entryError)) {
          navigation.navigate('OnboardingCompletion');
          return;
        }

        console.error('Failed to save onboarding entry:', entryError);
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
        <Text style={styles.skipMessage}>{COPY.daily.breathSkipMessage}</Text>
      </View>
    );
  }

  if (breathing) {
    return (
      <View style={styles.container}>
        <BreathingAnimation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setBreathing(true)}>
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
  prompt: { fontSize: FONT_SIZES.xxl, color: COLORS.primary, fontWeight: '300', marginBottom: SPACING.xxl },
  skipButton: { marginTop: SPACING.xl },
  skipText: { fontSize: FONT_SIZES.md, color: COLORS.muted },
  skipMessage: { fontSize: FONT_SIZES.lg, color: COLORS.secondary, fontStyle: 'italic' },
  errorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});
