import { RAVELRY_COLOURWAYS_PATH, RavelryColourway } from './types';

export async function fetchRavelryColourways(
  yarnId: number,
  signal: AbortSignal,
): Promise<RavelryColourway[]> {
  const response = await fetch(
    `${RAVELRY_COLOURWAYS_PATH}?${new URLSearchParams({ yarnId: String(yarnId) })}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Ravelry colourway lookup failed with ${response.status}`);
  }
  const { colourways } = (await response.json()) as {
    colourways: RavelryColourway[];
  };
  return colourways;
}
