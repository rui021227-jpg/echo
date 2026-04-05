import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { EMOJI_SCALE } from '../../constants/emojis';
import { EmojiCircle } from '../../components/EmojiCircle';
import { todayISO } from '../../utils/dateHelpers';

const S = {
  bg: '#fcf9f1',
};

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingEmojiPicker'>;

export function OnboardingEmojiPickerScreen({ navigation }: Props) {
  const [isSelecting, setIsSelecting] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      setIsSelecting(false);
      setSelectedIndex(null);
    }, []),
  );

  const handlePress = (index: number, score: number) => {
    if (isSelecting) return;
    setSelectedIndex(index);
    setIsSelecting(true);
    navigation.navigate('OnboardingWordInput', {
      emojiScore: score,
      date: todayISO(),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.emojiRow}>
        {EMOJI_SCALE.map((option, i) => (
          <EmojiCircle
            key={option.score}
            emoji={option.emoji}
            selected={selectedIndex === i}
            onPress={() => handlePress(i, option.score)}
            size={64}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: S.bg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
