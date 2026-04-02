import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { FadeOverlay } from '../../components/FadeOverlay';
import { useApp } from '../../state/AppContext';

type Props = NativeStackScreenProps<MainStackParamList, 'Completion'>;

const DISPLAY_DURATION_MS = 2800;

export function CompletionScreen({ navigation }: Props) {
  const [fading, setFading] = useState(false);
  const { endTimedSession, secondsRemaining, isTimedSessionActive } = useApp();

  const handleFadeComplete = useCallback(() => {
    endTimedSession();
    navigation.reset({ index: 0, routes: [{ name: 'EmojiPicker' }] });
  }, [endTimedSession, navigation]);

  useEffect(() => {
    const timer = setTimeout(() => setFading(true), DISPLAY_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {isTimedSessionActive ? (
        <Text style={styles.timer}>{secondsRemaining}s</Text>
      ) : null}

      <Text style={styles.anchor}>{COPY.daily.completionAnchor}</Text>
      <Text style={styles.message}>{COPY.daily.completionMessage}</Text>

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
    paddingHorizontal: SPACING.xl,
  },
  timer: {
    position: 'absolute',
    top: SPACING.xxxl,
    right: SPACING.xl,
    fontSize: FONT_SIZES.sm,
    color: COLORS.muted,
  },
  anchor: {
    fontSize: FONT_SIZES.emoji,
    marginBottom: SPACING.lg,
  },
  message: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '300',
    textAlign: 'center',
  },
});
