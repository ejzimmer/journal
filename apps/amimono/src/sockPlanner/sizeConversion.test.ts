import { convertToEuSize } from './sizeConversion';

describe('convertToEuSize', () => {
  describe('from EU sizes', () => {
    it('rounds half sizes to the nearest whole size', () => {
      expect(convertToEuSize(38.5, 'eu')).toBe(39);
    });
  });

  describe('from UK sizes', () => {
    it('converts with the standard formula, rounded normally', () => {
      expect(convertToEuSize(4, 'uk')).toBe(37);
      expect(convertToEuSize(6, 'uk')).toBe(39);
      expect(convertToEuSize(10, 'uk')).toBe(44);
    });
  });

  describe('from US sizes', () => {
    it("treats men's sizes as one more than UK", () => {
      expect(convertToEuSize(11, 'usMen')).toBe(convertToEuSize(10, 'uk'));
    });

    it("treats women's sizes as two more than UK", () => {
      expect(convertToEuSize(8, 'usWomen')).toBe(convertToEuSize(6, 'uk'));
    });
  });

  describe('from AU sizes', () => {
    it("treats men's sizes as UK sizes", () => {
      expect(convertToEuSize(10, 'auMen')).toBe(convertToEuSize(10, 'uk'));
    });

    it("treats women's sizes as two more than UK", () => {
      expect(convertToEuSize(8, 'auWomen')).toBe(convertToEuSize(6, 'uk'));
    });
  });
});
