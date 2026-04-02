export const COPY = {
  // App
  appName: 'ECHO',
  tagline: 'Emoji. Word. Breath. Done.',

  // Onboarding
  onboarding: {
    getStarted: 'Get started',
    disclaimer: 'Not a medical device or therapy tool.',
    emojiExplain: 'Pick how you feel. Once a day.',
    notificationTitle: 'We tap your shoulder once a day. That\u2019s it.',
    notificationAllow: 'Allow notifications',
    notificationSkip: 'You can enable this later in Settings.',
    reminderTitle: 'We\u2019ll come to you.',
    setReminder: 'Set reminder',
  },

  // Daily loop
  daily: {
    wordPlaceholder: 'one word',
    wordDone: 'Done',
    breathPrompt: '60 seconds?',
    breathSkip: 'skip',
    breathSkipMessage: 'Rest counts too.',
    alreadyDoneTitle: 'You already checked in today.',
    alreadyDoneSubtitle: 'Come back tomorrow for the next one.',
    alreadyDoneNotification: 'You are done for today.',
    saveError: 'We could not save today\u2019s check-in.',
    emojiHeading: 'how are you feeling?',
    emojiSubtitle: 'there\u2019s no wrong answer',
    wordHeading: 'one word for right now',
    wordInputPlaceholder: 'type something\u2026',
    breatheHeading: 'take a breath',
    breatheInhale: 'breathe in',
    breatheExhale: 'breathe out',
    breatheSubheading: 'follow the circle',
    completionAnchor: '\u{1F319}',
    completionMessage: 'you showed up today \u2728',
    completionClosing: 'closing\u2026',
  },

  // Reflection
  reflection: {
    seeYou: 'See you next Sunday.',
    fallback: 'You showed up this week. That matters. See you Sunday.',
  },

  // Notifications
  notifications: {
    dailyVariants: [
      'Ready when you are.',
      'One emoji. That\u2019s it.',
      'Check in with yourself.',
      'A moment for you.',
      'Tap when you\u2019re ready.',
    ],
    sundayTitle: 'Your week, reflected.',
  },

  // Settings
  settings: {
    title: 'Settings',
    reminderTime: 'Reminder time',
    manageSubscription: 'Manage subscription',
    about: 'About',
    privacyPolicy: 'Privacy policy',
  },

  // About
  about: {
    disclaimer:
      'This app is not a medical device, therapy tool, or crisis service. The AI reflection feature provides observations only, not diagnoses or recommendations.',
  },

  // Paywall
  paywall: {
    title: 'Unlock weekly reflections',
    monthly: '$4.99 / month',
    yearly: '$29.99 / year',
    yearlySavings: 'Save 50%',
    features: [
      'Weekly Sunday reflections',
      'Illustrated avatars (coming soon)',
    ],
    restore: 'Restore purchases',
    unavailable: 'Subscriptions are unavailable right now.',
    unavailableDetail: 'Please try again later or restore an existing purchase.',
    purchaseError: 'We could not complete that purchase.',
  },
} as const;
