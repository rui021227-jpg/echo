import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

const INHALE_DURATION = 4000;
const EXHALE_DURATION = 4000;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.0;

export function BreathingAnimation() {
  const scale = useSharedValue(MIN_SCALE);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(MAX_SCALE, {
          duration: INHALE_DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(MIN_SCALE, {
          duration: EXHALE_DURATION,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1, // infinite
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 200,
    height: 200,
  },
  circle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.accent,
    opacity: 0.6,
  },
});
