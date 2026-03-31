import React from 'react';
import { useApp } from '../store/AppContext';
import { OnboardingNavigator } from './OnboardingNavigator';
import { MainNavigator } from './MainNavigator';

export function RootNavigator() {
  const { onboardingComplete } = useApp();

  if (!onboardingComplete) {
    return <OnboardingNavigator />;
  }

  return <MainNavigator />;
}
