// CSS Color 4 conversion between LCH and sRGB (Lab uses the D50 white point,
// as browsers do), used to pre-blend a translucent lch() colour against a
// white background so it can be expressed as an equivalent opaque colour.

type Triple = [number, number, number]

function multiplyMatrix(matrix: Triple[], vector: Triple): Triple {
  return matrix.map(
    ([a, b, c]) => a * vector[0] + b * vector[1] + c * vector[2],
  ) as Triple
}

const D50_WHITE: Triple = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585]

function lchToLab([l, c, h]: Triple): Triple {
  const hRadians = (h * Math.PI) / 180
  return [l, c * Math.cos(hRadians), c * Math.sin(hRadians)]
}

function labToLch([l, a, b]: Triple): Triple {
  const hue = (Math.atan2(b, a) * 180) / Math.PI
  return [l, Math.sqrt(a * a + b * b), hue >= 0 ? hue : hue + 360]
}

function labToXyz([l, a, b]: Triple): Triple {
  const kappa = 24389 / 27
  const epsilon = 216 / 24389
  const f1 = (l + 16) / 116
  const f0 = a / 500 + f1
  const f2 = f1 - b / 200
  const xyz: Triple = [
    f0 ** 3 > epsilon ? f0 ** 3 : (116 * f0 - 16) / kappa,
    l > kappa * epsilon ? ((l + 16) / 116) ** 3 : l / kappa,
    f2 ** 3 > epsilon ? f2 ** 3 : (116 * f2 - 16) / kappa,
  ]
  return xyz.map((value, i) => value * D50_WHITE[i]) as Triple
}

function xyzToLab(xyz: Triple): Triple {
  const kappa = 24389 / 27
  const epsilon = 216 / 24389
  const scaled = xyz.map((value, i) => value / D50_WHITE[i])
  const f = scaled.map((value) =>
    value > epsilon ? Math.cbrt(value) : (kappa * value + 16) / 116,
  )
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])]
}

const D50_TO_D65: Triple[] = [
  [0.9554734527042182, -0.023098536874261423, 0.0632593086610217],
  [-0.028369706963208136, 1.0099954580058226, 0.021041398966943008],
  [0.012314001688319899, -0.020507696433477912, 1.3303659366080753],
]

const D65_TO_D50: Triple[] = [
  [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
  [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
  [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008],
]

const XYZ_TO_LINEAR_SRGB: Triple[] = [
  [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
  [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
  [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
]

const LINEAR_SRGB_TO_XYZ: Triple[] = [
  [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
  [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
  [0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
]

function linearSrgbToSrgb(rgb: Triple): Triple {
  return rgb.map((value) => {
    const sign = value < 0 ? -1 : 1
    const abs = Math.abs(value)
    return abs > 0.0031308
      ? sign * (1.055 * abs ** (1 / 2.4) - 0.055)
      : 12.92 * value
  }) as Triple
}

function srgbToLinearSrgb(rgb: Triple): Triple {
  return rgb.map((value) => {
    const sign = value < 0 ? -1 : 1
    const abs = Math.abs(value)
    return abs <= 0.04045 ? value / 12.92 : sign * ((abs + 0.055) / 1.055) ** 2.4
  }) as Triple
}

function lchToSrgb(lch: Triple): Triple {
  const xyzD65 = multiplyMatrix(D50_TO_D65, labToXyz(lchToLab(lch)))
  return linearSrgbToSrgb(multiplyMatrix(XYZ_TO_LINEAR_SRGB, xyzD65))
}

function srgbToLch(rgb: Triple): Triple {
  const xyzD50 = multiplyMatrix(
    D65_TO_D50,
    multiplyMatrix(LINEAR_SRGB_TO_XYZ, srgbToLinearSrgb(rgb)),
  )
  return labToLch(xyzToLab(xyzD50))
}

/**
 * Given a translucent `lch(lightness% chroma hue / alpha)` colour, returns the
 * equivalent fully opaque `lch()` colour it would produce when composited
 * over a white background - matching how browsers alpha-blend: against the
 * colour's clamped, in-gamut sRGB value, in gamma-encoded (non-linear) space.
 */
export function opaqueLchOnWhite(
  lightness: number,
  chroma: number,
  hue: number,
  alpha: number,
): string {
  const rgb = lchToSrgb([lightness, chroma, hue]).map((value) =>
    Math.min(1, Math.max(0, value)),
  ) as Triple
  const blended = rgb.map((value) => value * alpha + (1 - alpha)) as Triple
  const [l, c, h] = srgbToLch(blended)

  return `lch(${l}% ${c} ${h})`
}
