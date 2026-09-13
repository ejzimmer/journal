export const BAND_COLOURS = [
  { name: "Red", hue: 25 },
  { name: "Orange", hue: 55 },
  { name: "Olive", hue: 110 },
  { name: "Green", hue: 148 },
  { name: "Teal", hue: 190 },
  { name: "Blue", hue: 240 },
  { name: "Indigo", hue: 275 },
  { name: "Violet", hue: 305 },
  { name: "Magenta", hue: 330 },
  { name: "Pink", hue: 355 },
]

export function getRandomBandHue(): number {
  const index = Math.floor(Math.random() * BAND_COLOURS.length)
  return BAND_COLOURS[index].hue
}
