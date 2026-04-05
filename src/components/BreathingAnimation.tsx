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

const S = {
  green: '#586a48',
  greenLight: 'rgba(88,106,72,0.07)',
  greenMid: 'rgba(88,106,72,0.15)',
  cream: '#ffdcc4',
  peach: '#ffcf93',
  peachGlow: 'rgba(255,207,147,0.18)',
  peachGlowOuter: 'rgba(255,207,147,0.08)',
};

const GradientCircle = Animated.createAnimatedComponent(LinearGradient);

interface Props {
  isBreathing: boolean;
}

export function BreathingAnimation({ isBreathing }: Props) {
  const outerScale = useSharedValue(1);
  const midScale = useSharedValue(1);
  const innerScale = useSharedValue(1);
  const coreScale = useSharedValue(1);

  useEffect(() => {
    if (!isBreathing) return;

    // Outer ambient ring: slow 10s swell
    outerScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 5000, easing: Easing.inOut(Easing.sine) }),
        withTiming(0.95, { duration: 5000, easing: Easing.inOut(Easing.sine) }),
      ),
      -1,
      true,
    );

    // Middle ring: 8s cycle
    midScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 4000, easing: Easing.inOut(Easing.cubic) }),
        withTiming(0.96, { duration: 4000, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      true,
    );

    // Inner gradient circle: 4s inhale + 2s hold + 4s exhale
    innerScale.value = withRepeat(
      withSequence(
        withTiming(1.18, { duration: 4000, easing: Easing.inOut(Easing.cubic) }),
        withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.sine) }),
        withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.cubic) }),
      ),
      -1,
      false,
    );

    // Core: fast heartbeat-like pulse
    coreScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1000, easing: Easing.out(Easing.cubic) }),
        withTiming(1.0, { duration: 1000, easing: Easing.in(Easing.cubic) }),
      ),
      -1,
      true,
    );
  }, [isBreathing, outerScale, midScale, innerScale, coreScale]);

  const outerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: outerScale.value }],
  }));

  const midStyle = useAnimatedStyle(() => ({
    transform: [{ scale: midScale.value }],
  }));

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerScale.value }],
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coreScale.value }],
  }));

  return (
    <View style={styles.container}>
      {/* Outer ambient glow ring */}
      <Animated.View style={[styles.outerRing, outerStyle]} />

      {/* Middle pulse ring */}
      <Animated.View style={[styles.midRing, midStyle]} />

      {/* Inner breathing circle — LinearGradient */}
      <GradientCircle
        colors={[S.peach, S.cream]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.innerCircle, innerStyle]}
      />

      {/* Core solid green dot */}
      <Animated.View style={[styles.core, coreStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: S.peachGlowOuter,
  },
  midRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: S.greenLight,
  },
  innerCircle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    shadowColor: S.peach,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 8,
  },
  core: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: S.green,
  },
});
