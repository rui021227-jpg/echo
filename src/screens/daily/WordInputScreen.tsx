import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../../types/navigation';
import { useApp } from '../../state/AppContext';
import { WordStep } from '../../components/WordStep';

type Props = NativeStackScreenProps<MainStackParamList, 'WordInput'>;

export function WordInputScreen({ navigation, route }: Props) {
  const { emojiScore, date } = route.params;
  const { secondsRemaining, isTimedSessionActive } = useApp();

  return (
    <WordStep
      secondsRemaining={secondsRemaining}
      isTimedSessionActive={isTimedSessionActive}
      onSubmit={(word) =>
        navigation.navigate('Breathing', {
          emojiScore,
          word,
          date,
        })
      }
    />
  );
}
