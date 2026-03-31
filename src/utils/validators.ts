const MAX_WORD_LENGTH = 20;

export function isValidWord(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.length > 0 && trimmed.length <= MAX_WORD_LENGTH;
}
