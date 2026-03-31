import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES } from '../../constants/theme';
import { FadeOverlay } from '../../components/FadeOverlay';
import { closeApp } from '../../utils/closeApp';
import { useApp } from '../../store/AppContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Completion'>;

const DISPLAY_DURATION_MS = 3000;

export function CompletionScreen({}: Props) {
  const [fading, setFading] = useState(false);
  const { endTimedSession, secondsRemaining, isTimedSessionActive } = useApp();

  const handleFadeComplete = useCallback(() => {
    endTimedSession();
    closeApp();
  }, [endTimedSession]);

  useEffect(() => {
    const timer = setTimeout(() => setFading(true), DISPLAY_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {isTimedSessionActive ? (
        <Text style={styles.timer}>{secondsRemaining}s</Text>
      ) : null}
      <Text style={styles.checkmark}>✓</Text>
      <FadeOverlay visible={fading} onFadeComplete={handleFadeComplete} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timer: {
    position: 'absolute',
    top: 64,
    right: 32,
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
  },
  checkmark: {
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.accent,
    fontWeight: '300',
  },
});
