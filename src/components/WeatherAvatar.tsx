import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { AvatarKey } from '../types/reflection';
import { AVATAR_MAP } from '../constants/avatars';

interface Props {
  avatarKey: AvatarKey;
  size?: number;
}

export function WeatherAvatar({ avatarKey, size = 120 }: Props) {
  const config = AVATAR_MAP[avatarKey] ?? AVATAR_MAP.cloudy;

  return (
    <LinearGradient
      colors={[config.gradientStart, config.gradientEnd]}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>
        {config.emoji}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emoji: {
    textAlign: 'center',
  },
});
