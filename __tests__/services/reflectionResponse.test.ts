import { parseAIResponse } from '../../src/services/reflection';

describe('parseAIResponse', () => {
  it('accepts a valid AI response', () => {
    expect(
      parseAIResponse({
        s1: 'Sentence one',
        s2: 'Sentence two',
        s3: 'Sentence three',
        avatar: 'sunny',
        crisis: false,
      }),
    ).toEqual({
      s1: 'Sentence one',
      s2: 'Sentence two',
      s3: 'Sentence three',
      avatar: 'sunny',
      crisis: false,
    });
  });

  it('falls back to cloudy for an invalid avatar key', () => {
    expect(
      parseAIResponse({
        s1: 'Sentence one',
        s2: 'Sentence two',
        s3: 'Sentence three',
        avatar: 'unknown',
      }),
    ).toMatchObject({
      avatar: 'cloudy',
    });
  });

  it('throws when a sentence is missing', () => {
    expect(() =>
      parseAIResponse({
        s1: 'Sentence one',
        s2: 'Sentence two',
        avatar: 'sunny',
      }),
    ).toThrow('Malformed AI response');
  });

  it('throws when crisis is not a boolean', () => {
    expect(() =>
      parseAIResponse({
        s1: 'Sentence one',
        s2: 'Sentence two',
        s3: 'Sentence three',
        avatar: 'sunny',
        crisis: 'yes',
      }),
    ).toThrow('Malformed AI response');
  });
});
