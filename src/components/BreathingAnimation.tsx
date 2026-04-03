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
import { LinearGradient } from 'expo-linear-gradient';
import { GRADIENTS } from '../constants/theme';

const INHALE_DURATION = 4000;
const EXHALE_DURATION = 4000;
const MIN_SCALE = 0.4;
const MAX_SCALE = 1.0;

const GradientCircle = Animated.createAnimatedComponent(LinearGradient);

export function BreathingAnimation() {
  const scale = useSharedValue(MIN_SCALE);
  const opacityVal = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(MAX_SCALE, { duration: INHALE_DURATION, easing: Easing.inOut(Easing.ease) }),
        withTiming(MIN_SCALE, { duration: EXHALE_DURATION, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
    opacityVal.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: INHALE_DURATION, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: EXHALE_DURATION, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [scale, opacityVal]);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacityVal.value,
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 1.35 }],
    opacity: opacityVal.value * 0.5,
  }));

  const style3 = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * 1.7 }],
    opacity: opacityVal.value * 0.2,
  }));

  return (
    <View style={styles.container}>
      <GradientCircle
        colors={GRADIENTS.accent}
        style={[styles.circle, styles.absoluteCenter, style3]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <GradientCircle
        colors={GRADIENTS.accent}
        style={[styles.circle, styles.absoluteCenter, style2]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
      <GradientCircle
        colors={GRADIENTS.accent}
        style={[styles.circle, styles.absoluteCenter, style1]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 250,
    height: 250,
  },
  absoluteCenter: {
    position: 'absolute',
  },
  circle: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
});
