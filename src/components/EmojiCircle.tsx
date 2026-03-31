import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { EmojiOption } from '../constants/emojis';
import { FONT_SIZES } from '../constants/theme';

interface Props {
  option: EmojiOption;
  onPress: (score: number) => void;
}

export function EmojiCircle({ option, onPress }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress(option.score);
  };

  return (
    <TouchableOpacity
      style={[styles.circle, { backgroundColor: option.color }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.emoji}>{option.emoji}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: FONT_SIZES.emoji,
  },
});
