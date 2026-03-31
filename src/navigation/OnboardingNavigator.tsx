import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../types/navigation';
import { COLORS } from '../constants/theme';

import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { EmojiExplainScreen } from '../screens/onboarding/EmojiExplainScreen';
import { NotificationScreen } from '../screens/onboarding/NotificationScreen';
import { ReminderTimeScreen } from '../screens/onboarding/ReminderTimeScreen';
import { OnboardingEmojiPickerScreen } from '../screens/onboarding/OnboardingEmojiPickerScreen';
import { OnboardingWordInputScreen } from '../screens/onboarding/OnboardingWordInputScreen';
import { OnboardingBreathingScreen } from '../screens/onboarding/OnboardingBreathingScreen';
import { OnboardingCompletionScreen } from '../screens/onboarding/OnboardingCompletionScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="EmojiExplain" component={EmojiExplainScreen} />
      <Stack.Screen name="NotificationPermission" component={NotificationScreen} />
      <Stack.Screen name="ReminderTime" component={ReminderTimeScreen} />
      {/* First entry — reuses daily flow screens, typed for onboarding stack */}
      <Stack.Screen name="OnboardingEmojiPicker" component={OnboardingEmojiPickerScreen} />
      <Stack.Screen name="OnboardingWordInput" component={OnboardingWordInputScreen} />
      <Stack.Screen name="OnboardingBreathing" component={OnboardingBreathingScreen} />
      <Stack.Screen name="OnboardingCompletion" component={OnboardingCompletionScreen} />
    </Stack.Navigator>
  );
}
