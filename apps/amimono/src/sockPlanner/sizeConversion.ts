export const SIZE_SYSTEMS = {
  eu: 'EU',
  uk: 'UK',
  usMen: "US men's",
  usWomen: "US women's",
  auMen: "AU men's",
  auWomen: "AU women's",
} as const;

export type SizeSystem = keyof typeof SIZE_SYSTEMS;

const UK_SIZE_OFFSETS: Record<Exclude<SizeSystem, 'eu'>, number> = {
  uk: 0,
  usMen: 1,
  usWomen: 2,
  auMen: 0,
  auWomen: 2,
};

export function convertToEuSize(size: number, system: SizeSystem) {
  if (system === 'eu') return Math.round(size);

  const ukSize = size - UK_SIZE_OFFSETS[system];
  return Math.round(1.27 * (ukSize + 25));
}
