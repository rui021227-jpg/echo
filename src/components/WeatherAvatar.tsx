import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AvatarKey } from '../types/reflection';
import { AVATAR_MAP } from '../constants/avatars';

const S = {
  peachGlow: 'rgba(255,207,147,0.18)',
  textMain: '#1c1c17',
};

interface Props {
  avatarKey: AvatarKey | string;
  label?: string;
  size?: number;
}

export function WeatherAvatar({ avatarKey, label, size = 64 }: Props) {
  const config = AVATAR_MAP[avatarKey as AvatarKey] ?? null;
  const emoji = config?.emoji ?? '🌤️';
  const resolvedLabel = label ?? config?.label;

  const containerSize = size + 32;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize / 2,
          },
        ]}
      >
        <Text style={[styles.emoji, { fontSize: size }]}>{emoji}</Text>
      </View>
      {resolvedLabel ? (
        <Text style={styles.label}>{resolvedLabel}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    backgroundColor: S.peachGlow,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  emoji: {
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '600',
    color: S.textMain,
    textAlign: 'center',
  },
});
