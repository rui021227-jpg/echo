import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../types/navigation';
import { WordStep } from '../../components/WordStep';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingWordInput'>;

export function OnboardingWordInputScreen({ navigation, route }: Props) {
  const { emojiScore, date } = route.params;

  return (
    <WordStep
      onSubmit={(word) =>
        navigation.navigate('OnboardingBreathing', {
          emojiScore,
          word,
          date,
        })
      }
    />
  );
}
