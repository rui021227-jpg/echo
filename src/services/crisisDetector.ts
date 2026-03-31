import type { AIResponse } from '../types/reflection';

export function isCrisis(response: AIResponse): boolean {
  return response.crisis === true;
}
