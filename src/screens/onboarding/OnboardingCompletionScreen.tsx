import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES } from '../../constants/theme';
import { setSetting } from '../../db/database';
import { useApp } from '../../store/AppContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingCompletion'>;

export function OnboardingCompletionScreen({}: Props) {
  const { setOnboardingComplete } = useApp();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function finish() {
      await setSetting('onboarding_complete', '1');
      // Small delay so the checkmark is visible before transition
      timeoutRef.current = setTimeout(() => {
        if (active) {
          setOnboardingComplete(true);
        }
      }, 2000);
    }

    void finish();

    return () => {
      active = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [setOnboardingComplete]);

  return (
    <View style={styles.container}>
      <Text style={styles.checkmark}>✓</Text>
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
  checkmark: {
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.accent,
    fontWeight: '300',
  },
});
