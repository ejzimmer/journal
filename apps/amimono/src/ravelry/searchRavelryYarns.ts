import { RAVELRY_YARN_SEARCH_PATH, RavelryYarn } from './types';

export async function searchRavelryYarns(
  query: string,
  signal: AbortSignal,
): Promise<RavelryYarn[]> {
  const response = await fetch(
    `${RAVELRY_YARN_SEARCH_PATH}?${new URLSearchParams({ query })}`,
    { signal },
  );
  if (!response.ok) {
    throw new Error(`Ravelry yarn search failed with ${response.status}`);
  }
  const { yarns } = (await response.json()) as { yarns: RavelryYarn[] };
  return yarns;
}
