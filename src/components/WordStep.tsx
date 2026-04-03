import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, GRADIENTS, SHADOWS } from '../constants/theme';
import { COPY } from '../constants/copy';
import { isValidWord } from '../utils/validators';
import { AppScreen } from './AppScreen';
import { GlassCard } from './GlassCard';

interface Props {
  onSubmit: (word: string) => void;
  secondsRemaining?: number;
  isTimedSessionActive?: boolean;
}

const MAX_LENGTH = 20;

export function WordStep({
  onSubmit,
  secondsRemaining = 0,
  isTimedSessionActive = false,
}: Props) {
  const [word, setWord] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsSubmitting(false);
    }, []),
  );

  const handleDone = () => {
    if (isSubmitting || !isValidWord(word)) {
      return;
    }

    setIsSubmitting(true);
    onSubmit(word.trim());
  };

  return (
    <AppScreen scroll keyboard centered contentContainerStyle={styles.screenContent}>
      {isTimedSessionActive ? <Text style={styles.timer}>{secondsRemaining}s</Text> : null}

      <GlassCard glow bordered style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={COPY.daily.wordPlaceholder}
          placeholderTextColor={COLORS.muted}
          value={word}
          onChangeText={setWord}
          maxLength={MAX_LENGTH}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleDone}
          editable={!isSubmitting}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.counter}>
          {word.length}/{MAX_LENGTH}
        </Text>
      </GlassCard>

      <TouchableOpacity
        style={[
          styles.buttonWrapper,
          (!isValidWord(word) || isSubmitting) && styles.buttonDisabled,
        ]}
        onPress={handleDone}
        disabled={!isValidWord(word) || isSubmitting}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={GRADIENTS.accent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.buttonText}>{COPY.daily.wordDone}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    width: '100%',
    paddingVertical: SPACING.xxxl,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  timer: {
    position: 'absolute',
    top: SPACING.xl,
    right: 0,
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
  },
  input: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
    textAlign: 'center',
    paddingVertical: SPACING.md,
    width: '100%',
  },
  counter: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.muted,
    textAlign: 'right',
    marginTop: SPACING.xs,
  },
  buttonWrapper: {
    ...SHADOWS.glow,
    borderRadius: 12,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: 12,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
});
