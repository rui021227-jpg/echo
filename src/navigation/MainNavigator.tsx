import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MainStackParamList } from '../types/navigation';
import { EmojiPickerScreen } from '../screens/daily/EmojiPickerScreen';
import { WordInputScreen } from '../screens/daily/WordInputScreen';
import { BreathingScreen } from '../screens/daily/BreathingScreen';
import { CompletionScreen } from '../screens/daily/CompletionScreen';
import { ReflectionCardScreen } from '../screens/reflection/ReflectionCardScreen';
import { CrisisCardScreen } from '../screens/reflection/CrisisCardScreen';
import { PaywallScreen } from '../screens/paywall/PaywallScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AboutScreen } from '../screens/settings/AboutScreen';
import { COLORS } from '../constants/theme';

const Stack = createNativeStackNavigator<MainStackParamList>();

export function MainNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="EmojiPicker" component={EmojiPickerScreen} />
      <Stack.Screen name="WordInput" component={WordInputScreen} />
      <Stack.Screen name="Breathing" component={BreathingScreen} />
      <Stack.Screen name="Completion" component={CompletionScreen} />
      <Stack.Screen name="ReflectionCard" component={ReflectionCardScreen} />
      <Stack.Screen name="CrisisCard" component={CrisisCardScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
}
