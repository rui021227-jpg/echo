export const CRISIS_CARD_TEXT =
  'It looks like this has been a hard week. You do not have to handle it alone.';

export const CRISIS_LINES: Record<string, string> = {
  'en-US': '988 Suicide & Crisis Lifeline: 988',
  'en-GB': 'Samaritans: 116 123',
  'en-AU': 'Lifeline: 13 11 14',
  'en-CA': 'Crisis Services Canada: 1-833-456-4566',
  'en-NZ': 'Need to Talk?: 1737',
  'en-IE': 'Samaritans: 116 123',
  en: '988 Suicide & Crisis Lifeline: 988', // fallback for generic English
};

export const CRISIS_PHONE_NUMBERS: Record<string, string> = {
  'en-US': '988',
  'en-GB': '116123',
  'en-AU': '131114',
  'en-CA': '18334564566',
  'en-NZ': '1737',
  'en-IE': '116123',
  en: '988',
};

export function getCrisisLine(locale: string): string {
  return (
    CRISIS_LINES[locale] ??
    CRISIS_LINES[locale.split('-')[0]] ??
    CRISIS_LINES['en']
  );
}

export function getCrisisPhone(locale: string): string {
  return (
    CRISIS_PHONE_NUMBERS[locale] ??
    CRISIS_PHONE_NUMBERS[locale.split('-')[0]] ??
    CRISIS_PHONE_NUMBERS['en']
  );
}
