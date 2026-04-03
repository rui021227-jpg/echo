import React, { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { insertEntry, isDuplicateEntryError } from '../../database/entries';
import type { EmojiScore } from '../../types/entry';
import { BreathingStep } from '../../components/BreathingStep';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingBreathing'>;

export function OnboardingBreathingScreen({ navigation, route }: Props) {
  const { emojiScore, word, date } = route.params;
  const handleComplete = useCallback(
    async (breathTaken: boolean) => {
      try {
        await insertEntry(date, emojiScore as EmojiScore, word, breathTaken);
      } catch (entryError) {
        if (!isDuplicateEntryError(entryError)) {
          console.error('Failed to save onboarding entry:', entryError);
          throw entryError;
        }
      }

      navigation.navigate('OnboardingCompletion');
    },
    [date, emojiScore, navigation, word],
  );

  return <BreathingStep onComplete={handleComplete} />;
}
