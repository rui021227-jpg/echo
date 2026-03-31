import { PROHIBITED_STRINGS } from '../constants/prohibited';
import type { AIResponse } from '../types/reflection';

export function isContentSafe(response: AIResponse): boolean {
  const text = `${response.s1} ${response.s2} ${response.s3}`.toLowerCase();
  return !PROHIBITED_STRINGS.some((term) => text.includes(term.toLowerCase()));
}
