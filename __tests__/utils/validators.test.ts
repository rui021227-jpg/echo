import { isValidWord } from '../../src/utils/validators';

describe('isValidWord', () => {
  it('accepts a single word', () => {
    expect(isValidWord('tired')).toBe(true);
  });

  it('accepts exactly 20 characters', () => {
    expect(isValidWord('a'.repeat(20))).toBe(true);
  });

  it('rejects 21 characters', () => {
    expect(isValidWord('a'.repeat(21))).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidWord('')).toBe(false);
  });

  it('rejects whitespace only', () => {
    expect(isValidWord('   ')).toBe(false);
  });

  it('accepts word with leading/trailing whitespace (trimmed)', () => {
    // " okay " trims to "okay" which is 4 chars — valid
    expect(isValidWord('  okay  ')).toBe(true);
  });
});
