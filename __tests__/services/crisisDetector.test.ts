import { isCrisis } from '../../src/services/crisisDetector';
import type { AIResponse } from '../../src/types/reflection';

describe('isCrisis', () => {
  it('returns true when crisis flag is true', () => {
    const response: AIResponse = {
      s1: 'Hard week.',
      s2: 'Pattern.',
      s3: 'Close.',
      avatar: 'stormy',
      crisis: true,
    };
    expect(isCrisis(response)).toBe(true);
  });

  it('returns false when crisis flag is false', () => {
    const response: AIResponse = {
      s1: 'Good week.',
      s2: 'Pattern.',
      s3: 'Close.',
      avatar: 'sunny',
      crisis: false,
    };
    expect(isCrisis(response)).toBe(false);
  });

  it('returns false when crisis flag is absent', () => {
    const response: AIResponse = {
      s1: 'Normal week.',
      s2: 'Pattern.',
      s3: 'Close.',
      avatar: 'cloudy',
    };
    expect(isCrisis(response)).toBe(false);
  });
});
