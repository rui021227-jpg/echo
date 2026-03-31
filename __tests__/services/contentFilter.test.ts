import { isContentSafe } from '../../src/services/contentFilter';
import type { AIResponse } from '../../src/types/reflection';

function makeResponse(s1: string, s2 = '', s3 = ''): AIResponse {
  return { s1, s2, s3, avatar: 'cloudy' };
}

describe('isContentSafe', () => {
  it('passes a clean response', () => {
    expect(isContentSafe(makeResponse(
      'You checked in four times this week.',
      'Words like tired and focused appeared more than once.',
      'The week had its texture.'
    ))).toBe(true);
  });

  it('blocks "should"', () => {
    expect(isContentSafe(makeResponse('You should try meditating.'))).toBe(false);
  });

  it('blocks "recommend"', () => {
    expect(isContentSafe(makeResponse('I recommend speaking to someone.'))).toBe(false);
  });

  it('blocks "disorder"', () => {
    expect(isContentSafe(makeResponse('This could be a sign of a disorder.'))).toBe(false);
  });

  it('blocks "diagnose"', () => {
    expect(isContentSafe(makeResponse('This does not diagnose anything.'))).toBe(false);
  });

  it('blocks "depressed"', () => {
    expect(isContentSafe(makeResponse('You seem depressed this week.'))).toBe(false);
  });

  it('blocks "anxiety disorder"', () => {
    expect(isContentSafe(makeResponse('This looks like anxiety disorder.'))).toBe(false);
  });

  it('blocks "mental illness"', () => {
    expect(isContentSafe(makeResponse('Mental illness affects many.'))).toBe(false);
  });

  it('blocks "you need to"', () => {
    expect(isContentSafe(makeResponse('You need to take a break.'))).toBe(false);
  });

  it('is case insensitive — uppercase SHOULD', () => {
    expect(isContentSafe(makeResponse('You SHOULD rest more.'))).toBe(false);
  });

  it('catches prohibited word in s2', () => {
    expect(isContentSafe(makeResponse(
      'You checked in three times.',
      'You should try harder.',
      'Rest is also valid.'
    ))).toBe(false);
  });

  it('catches prohibited word in s3', () => {
    expect(isContentSafe(makeResponse(
      'Clean sentence one.',
      'Clean sentence two.',
      'I recommend you rest.'
    ))).toBe(false);
  });

  it('does not block "disordered" — substring of "disorder" is a match', () => {
    // "disorder" is contained in "disordered" — our filter should catch it
    expect(isContentSafe(makeResponse('Sleep was disordered this week.'))).toBe(false);
  });

  it('passes response with empty s2 and s3', () => {
    expect(isContentSafe(makeResponse('A quiet week passed by.'))).toBe(true);
  });
});
