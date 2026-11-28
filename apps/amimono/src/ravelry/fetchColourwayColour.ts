import { RAVELRY_COLOURWAY_COLOUR_PATH } from './types';

export async function fetchColourwayColour(
  photoUrl: string,
  signal: AbortSignal,
): Promise<string> {
  const response = await fetch(
    `${RAVELRY_COLOURWAY_COLOUR_PATH}?${new URLSearchParams({ photoUrl })}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Colourway colour lookup failed with ${response.status}`);
  }
  const { colour } = (await response.json()) as { colour: string };
  return colour;
}
