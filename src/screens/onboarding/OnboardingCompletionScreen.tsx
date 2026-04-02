import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { setSetting } from '../../database/database';
import { useApp } from '../../state/AppContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingCompletion'>;

export function OnboardingCompletionScreen({}: Props) {
  const { setOnboardingComplete } = useApp();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scale = useSharedValue(0.6);
  const opacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
    opacity.value = withTiming(1, { duration: 400 });
    textOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));

    let active = true;

    async function finish() {
      await setSetting('onboarding_complete', '1');
      timeoutRef.current = setTimeout(() => {
        if (active) {
          setOnboardingComplete(true);
        }
      }, 2400);
    }

    void finish();

    return () => {
      active = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [setOnboardingComplete, scale, opacity, textOpacity]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, circleStyle]}>
        <Text style={styles.checkmark}>✓</Text>
      </Animated.View>

      <Animated.View style={[styles.textBlock, textStyle]}>
        <Text style={styles.message}>{COPY.onboarding.completionMessage}</Text>
        <Text style={styles.subtitle}>{COPY.onboarding.completionSubtitle}</Text>
      </Animated.View>
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
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  checkmark: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.background,
    fontWeight: '700',
  },
  textBlock: {
    alignItems: 'center',
  },
  message: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    fontWeight: '300',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});
