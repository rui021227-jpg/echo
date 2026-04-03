import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { COPY } from '../constants/copy';
import { AppScreen } from './AppScreen';
import { BreathingAnimation } from './BreathingAnimation';

interface Props {
  onComplete: (breathTaken: boolean) => Promise<void>;
  secondsRemaining?: number;
  isTimedSessionActive?: boolean;
}

const BREATHING_DURATION_MS = 60_000;
const SKIP_MESSAGE_DURATION_MS = 1500;

export function BreathingStep({
  onComplete,
  secondsRemaining = 0,
  isTimedSessionActive = false,
}: Props) {
  const [showSkipMessage, setShowSkipMessage] = useState(false);
  const [breathing, setBreathing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const skipTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

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

  const completeStep = useCallback(
    async (breathTaken: boolean) => {
      if (isCompleting) {
        return;
      }

      clearPendingTimeouts();
      setIsCompleting(true);

      try {
        await onComplete(breathTaken);
      } catch {
        if (mountedRef.current) {
          setError(COPY.daily.saveError);
          setIsCompleting(false);
        }
      }
    },
    [clearPendingTimeouts, isCompleting, onComplete],
  );

  const handleSkip = () => {
    if (showSkipMessage || breathing || isCompleting) {
      return;
    }

    if (skipTimeoutRef.current) {
      clearTimeout(skipTimeoutRef.current);
    }

    setShowSkipMessage(true);
    skipTimeoutRef.current = setTimeout(() => {
      void completeStep(false);
    }, SKIP_MESSAGE_DURATION_MS);
  };

  const handleStartBreathing = () => {
    if (showSkipMessage || breathing || isCompleting) {
      return;
    }

    setBreathing(true);
  };

  useEffect(() => {
    if (!breathing) {
      return;
    }

    breathingTimeoutRef.current = setTimeout(() => {
      void completeStep(true);
    }, BREATHING_DURATION_MS);

    return () => {
      if (breathingTimeoutRef.current) {
        clearTimeout(breathingTimeoutRef.current);
        breathingTimeoutRef.current = null;
      }
    };
  }, [breathing, completeStep]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearPendingTimeouts();
    };
  }, [clearPendingTimeouts]);

  if (error) {
    return (
      <AppScreen centered contentContainerStyle={styles.screenContent}>
        <Text style={styles.errorText}>{error}</Text>
      </AppScreen>
    );
  }

  if (showSkipMessage) {
    return (
      <AppScreen centered contentContainerStyle={styles.screenContent}>
        {isTimedSessionActive ? <Text style={styles.timer}>{secondsRemaining}s</Text> : null}
        <Text style={styles.skipMessage}>{COPY.daily.breathSkipMessage}</Text>
      </AppScreen>
    );
  }

  if (breathing) {
    return (
      <AppScreen centered contentContainerStyle={styles.screenContent}>
        {isTimedSessionActive ? <Text style={styles.timer}>{secondsRemaining}s</Text> : null}
        <BreathingAnimation />
      </AppScreen>
    );
  }

  return (
    <AppScreen centered contentContainerStyle={styles.screenContent}>
      {isTimedSessionActive ? <Text style={styles.timer}>{secondsRemaining}s</Text> : null}

      <TouchableOpacity onPress={handleStartBreathing} disabled={isCompleting}>
        <Text style={styles.prompt}>{COPY.daily.breathPrompt}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleSkip} style={styles.skipButton} disabled={isCompleting}>
        <Text style={styles.skipText}>{COPY.daily.breathSkip}</Text>
      </TouchableOpacity>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    width: '100%',
    paddingVertical: SPACING.xxxl,
  },
  prompt: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.primary,
    fontWeight: '300',
    marginBottom: SPACING.xxl,
  },
  timer: {
    position: 'absolute',
    top: SPACING.xl,
    right: 0,
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
