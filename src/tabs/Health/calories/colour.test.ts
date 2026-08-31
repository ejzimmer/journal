import { opaqueLchOnWhite } from "./colour"

// Expected values computed independently (Node script driving a headless
// Chromium canvas) by compositing `lch(78% 230 <hue> / <alpha>)` over white
// and converting the resulting opaque pixel back to LCH.
describe("opaqueLchOnWhite", () => {
  it.each([
    { hue: 77, alpha: 1, expected: [71.9607, 84.9186, 65.1328] },
    { hue: 77, alpha: 0.5, expected: [84.8652, 46.3352, 73.4706] },
    { hue: 77, alpha: 0.25, expected: [92.2321, 22.3444, 76.07] },
    { hue: 104, alpha: 1, expected: [78.5824, 90.2314, 123.6774] },
    { hue: 104, alpha: 0.5, expected: [88.3341, 55.2829, 121.5514] },
    { hue: 104, alpha: 0.1, expected: [97.5404, 11.1083, 123.0276] },
  ])(
    "matches the on-white composite for hue $hue at alpha $alpha",
    ({ hue, alpha, expected }) => {
      const result = opaqueLchOnWhite(78, 230, hue, alpha)
      const match = result.match(/^lch\(([\d.]+)% ([\d.]+) ([\d.]+)\)$/)

      expect(match).not.toBeNull()
      const [lightness, chroma, resultHue] = match!.slice(1).map(Number)

      expect(lightness).toBeCloseTo(expected[0], 3)
      expect(chroma).toBeCloseTo(expected[1], 3)
      expect(resultHue).toBeCloseTo(expected[2], 3)
    },
  )
})
