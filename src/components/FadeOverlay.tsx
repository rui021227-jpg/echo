import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface Props {
  visible: boolean;
  onFadeComplete?: () => void;
  duration?: number;
}

export function FadeOverlay({ visible, onFadeComplete, duration = 1000 }: Props) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration }, () => {
        if (onFadeComplete) {
          runOnJS(onFadeComplete)();
        }
      });
    }
  }, [visible, duration, onFadeComplete, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return <Animated.View style={[styles.overlay, animatedStyle]} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    zIndex: 999,
  },
});
