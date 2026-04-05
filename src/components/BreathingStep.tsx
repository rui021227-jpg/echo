import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { COPY } from '../constants/copy';
import { BreathingAnimation } from './BreathingAnimation';

const S = {
  surface: '#ffffff',
  green: '#586a48',
  textMain: '#1c1c17',
  textMuted: '#9e9e8e',
  textSecondary: '#6b6b5e',
};

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
      if (isCompleting) return;
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
    if (showSkipMessage || breathing || isCompleting) return;
    if (skipTimeoutRef.current) clearTimeout(skipTimeoutRef.current);
    setShowSkipMessage(true);
    skipTimeoutRef.current = setTimeout(() => {
      void completeStep(false);
    }, SKIP_MESSAGE_DURATION_MS);
  };

  const handleStartBreathing = () => {
    if (showSkipMessage || breathing || isCompleting) return;
    setBreathing(true);
  };

  useEffect(() => {
    if (!breathing) return;
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
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (showSkipMessage) {
    return (
      <View style={styles.center}>
        {isTimedSessionActive ? <Text style={styles.timer}>{secondsRemaining}s</Text> : null}
        <Text style={styles.skipMessage}>{COPY.daily.breathSkipMessage}</Text>
      </View>
    );
  }

  if (breathing) {
    return (
      <View style={styles.breathingLayout}>
        {isTimedSessionActive ? <Text style={styles.timer}>{secondsRemaining}s</Text> : null}
        <BreathingAnimation isBreathing={breathing} />
        <TouchableOpacity
          style={styles.skipPill}
          onPress={handleSkip}
          disabled={isCompleting}
        >
          <Text style={styles.skipPillText}>{COPY.daily.breathSkip}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.breathingLayout}>
      {isTimedSessionActive ? <Text style={styles.timer}>{secondsRemaining}s</Text> : null}
      <BreathingAnimation isBreathing={false} />
      <TouchableOpacity
        style={styles.startPrompt}
        onPress={handleStartBreathing}
        disabled={isCompleting}
      >
        <Text style={styles.startPromptText}>{COPY.daily.breathPrompt}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.skipPill}
        onPress={handleSkip}
        disabled={isCompleting}
      >
        <Text style={styles.skipPillText}>{COPY.daily.breathSkip}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breathingLayout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  timer: {
    position: 'absolute',
    top: 0,
    right: 0,
    fontSize: 13,
    color: S.textMuted,
  },
  startPrompt: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startPromptText: {
    fontSize: 18,
    fontWeight: '300',
    color: S.textSecondary,
    textAlign: 'center',
  },
  skipPill: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: S.surface,
    shadowColor: '#586a48',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  skipPillText: {
    fontSize: 14,
    color: S.textMuted,
  },
  skipMessage: {
    fontSize: 18,
    color: S.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 15,
    color: S.textSecondary,
    textAlign: 'center',
  },
});
