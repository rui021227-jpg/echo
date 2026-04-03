import React, { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { insertEntry, isDuplicateEntryError } from '../../database/entries';
import type { EmojiScore } from '../../types/entry';
import { useApp } from '../../state/AppContext';
import { BreathingStep } from '../../components/BreathingStep';

type Props = NativeStackScreenProps<MainStackParamList, 'Breathing'>;

export function BreathingScreen({ navigation, route }: Props) {
  const { emojiScore, word, date } = route.params;
  const { secondsRemaining, isTimedSessionActive } = useApp();
  const handleComplete = useCallback(
    async (breathTaken: boolean) => {
      try {
        await insertEntry(date, emojiScore as EmojiScore, word, breathTaken);
      } catch (entryError) {
        if (!isDuplicateEntryError(entryError)) {
          console.error('Failed to save entry:', entryError);
          throw entryError;
        }
      }

      navigation.navigate('Completion');
    },
    [date, emojiScore, navigation, word],
  );

  return (
    <BreathingStep
      secondsRemaining={secondsRemaining}
      isTimedSessionActive={isTimedSessionActive}
      onComplete={handleComplete}
    />
  );
}
