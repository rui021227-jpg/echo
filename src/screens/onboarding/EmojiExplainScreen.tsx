import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, FONT_SIZES, SPACING } from '../../constants/theme';
import { COPY } from '../../constants/copy';
import { EMOJI_SCALE } from '../../constants/emojis';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'EmojiExplain'>;

export function EmojiExplainScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.emojiRow}>
          {EMOJI_SCALE.map((e) => (
            <LinearGradient
              key={e.score}
              style={styles.emojiCircle}
              colors={e.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.emoji}>{e.emoji}</Text>
            </LinearGradient>
          ))}
        </View>
        <Text style={styles.explain}>{COPY.onboarding.emojiExplain}</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('NotificationPermission')}
      >
        <Text style={styles.buttonText}>{COPY.common.next}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  explain: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
});
