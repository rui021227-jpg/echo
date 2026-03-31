// Full onboarding flow: 5 intro screens + first entry daily loop
export type OnboardingStackParamList = {
  Welcome: undefined;
  EmojiExplain: undefined;
  NotificationPermission: undefined;
  ReminderTime: undefined;
  // First entry reuses the daily flow screens:
  OnboardingEmojiPicker: undefined;
  OnboardingWordInput: { emojiScore: number; date: string };
  OnboardingBreathing: { emojiScore: number; word: string; date: string };
  OnboardingCompletion: undefined;
};

export type MainStackParamList = {
  EmojiPicker: { fromNotification?: boolean } | undefined;
  WordInput: { emojiScore: number; date: string };
  Breathing: { emojiScore: number; word: string; date: string };
  Completion: undefined;
  ReflectionCard: { weekStart: string };
  CrisisCard: undefined;
  Paywall: { source: 'settings' | 'reflection'; weekStart?: string };
  Settings: undefined;
  About: undefined;
};
