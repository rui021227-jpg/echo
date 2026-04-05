import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const S = {
  surface: '#ffffff',
  green: '#586a48',
  cream: '#ffdcc4',
  peach: '#ffcf93',
  textMain: '#1c1c17',
  textMuted: '#9e9e8e',
};

interface Props {
  emoji: string;
  label?: string;
  selected: boolean;
  onPress: () => void;
  size?: number;
}

export function EmojiCircle({ emoji, label, selected, onPress, size = 56 }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const circleStyle = [
    styles.circle,
    { width: size, height: size, borderRadius: size / 2 },
    selected ? styles.circleSelected : styles.circleUnselected,
  ];

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
      >
        {selected ? (
          <LinearGradient
            colors={[S.peach, S.cream]}
            style={circleStyle}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</Text>
          </LinearGradient>
        ) : (
          <View style={circleStyle}>
            <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>{emoji}</Text>
          </View>
        )}
      </Pressable>
      {label ? (
        <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleSelected: {
    borderWidth: 2,
    borderColor: S.green,
    shadowColor: S.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  circleUnselected: {
    backgroundColor: S.surface,
    shadowColor: 'rgba(88,106,72,0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  emoji: {
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    color: '#9e9e8e',
  },
  labelSelected: {
    color: '#586a48',
    fontWeight: '600',
  },
});
