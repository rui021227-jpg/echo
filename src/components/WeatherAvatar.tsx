import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AvatarKey } from '../types/reflection';
import { AVATAR_MAP } from '../constants/avatars';

interface Props {
  avatarKey: AvatarKey;
  size?: number;
}

export function WeatherAvatar({ avatarKey, size = 120 }: Props) {
  const config = AVATAR_MAP[avatarKey] ?? AVATAR_MAP.cloudy;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: config.gradientStart,
        },
      ]}
    >
      <Text style={[styles.emoji, { fontSize: size * 0.5 }]}>
        {config.emoji}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});
