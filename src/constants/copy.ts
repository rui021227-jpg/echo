export const COPY = {
  // App
  appName: 'ECHO',
  tagline: 'Emoji. Word. Breath. Done.',

  // Shared labels
  common: {
    next: 'Next',
  },

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
    reminderError: 'We could not save that reminder.',
    completionMessage: 'You\u2019re all set \u2728',
    completionSubtitle: 'See you tomorrow.',
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
    seeYou: 'See you next Sunday 🌙',
    fallback: 'You showed up this week. That matters. See you Sunday.',
    errorMessage: 'Your reflection is on its way — check back later.',
    back: 'Back',
  },

  // Crisis card
  crisis: {
    anchor: '💙',
    heading: 'This week has been heavy.',
    subheading: 'You don\'t have to handle it alone.',
    callPrompt: 'Reach out — they\'re there for you.',
    callButton: 'Call now',
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
    reminderSaveError: 'We could not update your reminder.',
    hourLabel: 'Hour',
    minuteLabel: 'Minute',
    manageSubscription: 'Manage subscription',
    premiumStatus: 'Premium',
    freeStatus: 'Free',
    about: 'About',
    privacyPolicy: 'Privacy policy',
    sectionReminder: 'Daily reminder',
    sectionAccount: 'Account',
    sectionMore: 'More',
    arrow: '›',
    deleteAllData: 'Delete all data',
    deleteAllConfirmTitle: 'Delete all data?',
    deleteAllConfirmMessage: 'This will permanently delete all your check-ins and reflections. This cannot be undone.',
    deleteAllConfirmButton: 'Delete',
    deleteAllSuccess: 'All local check-ins and reflections were deleted.',
    deleteAllError: 'We could not delete your local data. Please try again.',
    cancel: 'Cancel',
  },

  // Cloud sync
  sync: {
    backupTitle: 'Back up data',
    backupSubtitle: 'Save to cloud',
    restoreTitle: 'Restore data',
    restoreSubtitle: 'Load from cloud',
    backingUp: 'Backing up\u2026',
    restoring: 'Restoring\u2026',
    backupSuccess: 'Backup complete',
    restoreSuccess: 'Restore complete',
    backupError: 'Backup failed. Please try again.',
    restoreError: 'Restore failed. Check your connection and try again.',
    noBackupError: 'No backup found. Back up your data first.',
    confirmRestoreTitle: 'Restore from cloud?',
    confirmRestoreMessage: 'This will merge cloud data with your current data. Existing entries will not be overwritten.',
    confirmRestoreButton: 'Restore',
  },

  // About
  about: {
    disclaimer:
      'This app is not a medical device, therapy tool, or crisis service. The AI reflection feature provides observations only, not diagnoses or recommendations.',
    mirror: 'Not a medical device. Not therapy. A mirror.',
  },

  // Paywall
  paywall: {
    title: 'Your week, reflected.',
    hero: '✨',
    subtitle:
      'Every Sunday, a 3-sentence reflection that actually says something about your week.',
    features: [
      '🌙  Weekly Sunday reflections',
      '✨  A reflection that gets you',
      '💜  Your week, seen',
    ],
    yearlyLabel: 'Yearly',
    yearlySavings: 'Best value',
    monthlyLabel: 'Monthly',
    restore: 'Restore purchases',
    maybeLater: 'maybe later',
    unavailable: 'Subscriptions are unavailable right now.',
    unavailableDetail: 'Please try again later or restore an existing purchase.',
    purchaseError: 'We could not complete that purchase.',
  },
} as const;
