export type ArcPosition = {
  across: number;
  height: number;
};

export function findArcPosition(
  hour: number,
  riseHour: number,
  setHour: number,
): ArcPosition | undefined {
  const hoursUp = (setHour - riseHour + 24) % 24;
  const hoursSinceRise = (hour - riseHour + 24) % 24;
  if (hoursSinceRise > hoursUp) return undefined;

  const across = hoursSinceRise / hoursUp;
  return { across, height: Math.sin(Math.PI * across) };
}
