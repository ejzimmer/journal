import { convertToEuSize } from './sizeConversion';

describe('convertToEuSize', () => {
  describe('from EU sizes', () => {
    it('rounds half sizes to the nearest whole size', () => {
      expect(convertToEuSize(38.5, 'eu')).toBe(39);
    });
  });

  describe('from UK sizes', () => {
    it('converts to the nearest EU size', () => {
      expect(convertToEuSize(4, 'uk')).toBe(37);
      expect(convertToEuSize(6, 'uk')).toBe(39);
      expect(convertToEuSize(10, 'uk')).toBe(44);
    });
  });

  describe('from US sizes', () => {
    it("converts men's sizes", () => {
      expect(convertToEuSize(11, 'usMen')).toBe(44);
    });

    it("converts women's sizes", () => {
      expect(convertToEuSize(8, 'usWomen')).toBe(39);
    });
  });

  describe('from AU sizes', () => {
    it("converts men's sizes", () => {
      expect(convertToEuSize(10, 'auMen')).toBe(44);
    });

    it("converts women's sizes", () => {
      expect(convertToEuSize(8, 'auWomen')).toBe(39);
    });
  });
});
