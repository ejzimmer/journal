import {
  calculateDefaultSockNumber,
  calculateSockNumbers,
} from './sockNumbers';
import { Recipient } from './types';

const createRecipient = (
  euSize: number,
  overrides?: Recipient['overrides'],
): Recipient => ({ id: 'someone', name: 'Someone', euSize, overrides });

describe('calculateSockNumbers', () => {
  describe('at the planner gauge', () => {
    it('takes the length from the size table', () => {
      expect(calculateSockNumbers(createRecipient(39)).lengthMm).toBe(246);
    });

    it('rounds the cast-on to a multiple of four', () => {
      expect(calculateSockNumbers(createRecipient(37)).castOnStitches).toBe(56);
      expect(calculateSockNumbers(createRecipient(44)).castOnStitches).toBe(80);
    });

    it('starts the toe at 90% of the length less 4 mm', () => {
      expect(calculateSockNumbers(createRecipient(41)).startToeAtMm).toBe(
        227.3,
      );
    });

    describe('for a size outside the table', () => {
      it('uses the smallest size for smaller feet', () => {
        expect(calculateSockNumbers(createRecipient(33)).lengthMm).toBe(213);
      });

      it('uses the largest size for bigger feet', () => {
        expect(calculateSockNumbers(createRecipient(49)).lengthMm).toBe(286);
      });
    });
  });

  describe('with overrides', () => {
    it('uses the overridden numbers', () => {
      expect(
        calculateSockNumbers(
          createRecipient(38, { castOnStitches: 56, startToeAtMm: 200 }),
        ),
      ).toEqual({ lengthMm: 235, castOnStitches: 56, startToeAtMm: 200 });
    });

    it('works out the toe from an overridden length', () => {
      expect(
        calculateSockNumbers(createRecipient(37, { lengthMm: 230 }))
          .startToeAtMm,
      ).toBe(203);
    });
  });

  describe('at another gauge', () => {
    it('scales the cast-on to the gauge, as a multiple of four', () => {
      expect(calculateSockNumbers(createRecipient(39), 28).castOnStitches).toBe(
        56,
      );
    });

    it('scales an overridden cast-on', () => {
      expect(
        calculateSockNumbers(createRecipient(38, { castOnStitches: 56 }), 36)
          .castOnStitches,
      ).toBe(64);
    });

    it('keeps the length and toe', () => {
      expect(calculateSockNumbers(createRecipient(39), 28)).toMatchObject({
        lengthMm: 246,
        startToeAtMm: 217.4,
      });
    });
  });
});

describe('calculateDefaultSockNumber', () => {
  it('ignores the override for that number', () => {
    expect(
      calculateDefaultSockNumber(
        createRecipient(38, { castOnStitches: 56 }),
        'castOnStitches',
      ),
    ).toBe(64);
  });

  it('keeps overrides that feed into it', () => {
    expect(
      calculateDefaultSockNumber(
        createRecipient(37, { lengthMm: 230, startToeAtMm: 190 }),
        'startToeAtMm',
      ),
    ).toBe(203);
  });
});
