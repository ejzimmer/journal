import { findMainColour } from './findMainColour';

function createImage(
  width: number,
  height: number,
  colourAt: (x: number, y: number) => number[],
) {
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      data.set([...colourAt(x, y), 255], (y * width + x) * 4);
    }
  }
  return { width, height, data };
}

const WHITE = [255, 255, 255];
const TEAL = [40, 120, 130];
const DARK_TEAL = [30, 100, 110];
const ORANGE = [230, 120, 30];

describe('findMainColour', () => {
  describe('when the yarn sits in the middle of a white background', () => {
    it('picks the yarn colour', () => {
      const image = createImage(40, 40, (x, y) =>
        x >= 10 && x < 30 && y >= 10 && y < 30 ? TEAL : WHITE,
      );

      expect(findMainColour(image)).toBe('#287882');
    });
  });

  describe('when the yarn has flecks of another colour', () => {
    it('picks the colour that covers most of it, averaged over its shades', () => {
      const image = createImage(40, 40, (x, y) => {
        if (x % 5 === 0) return ORANGE;
        return (x + y) % 2 ? TEAL : DARK_TEAL;
      });

      expect(findMainColour(image)).toBe('#236e78');
    });
  });
});
