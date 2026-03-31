import React from 'react';
import { View, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { COLORS, SPACING } from '../../constants/theme';
import { EMOJI_SCALE } from '../../constants/emojis';
import { EmojiCircle } from '../../components/EmojiCircle';
import { todayISO } from '../../utils/dateHelpers';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingEmojiPicker'>;

export function OnboardingEmojiPickerScreen({ navigation }: Props) {
  const handlePress = (score: number) => {
    navigation.navigate('OnboardingWordInput', {
      emojiScore: score,
      date: todayISO(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.emojiRow}>
        {EMOJI_SCALE.map((option) => (
          <EmojiCircle key={option.score} option={option} onPress={handlePress} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
});
