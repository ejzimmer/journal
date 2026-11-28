import { useEffect, useState } from 'react';

import { fetchRavelryColourways } from './fetchRavelryColourways';
import { RavelryColourway } from './types';

type FetchedColourways = {
  yarnId: number;
  colourways: RavelryColourway[];
};

export function useRavelryColourways(yarnId: number | undefined) {
  const [fetched, setFetched] = useState<FetchedColourways>();

  useEffect(() => {
    if (!yarnId) return;

    const controller = new AbortController();
    fetchRavelryColourways(yarnId, controller.signal)
      .then((colourways) => setFetched({ yarnId, colourways }))
      .catch(() => {
        if (!controller.signal.aborted) setFetched({ yarnId, colourways: [] });
      });

    return () => controller.abort();
  }, [yarnId]);

  return yarnId && fetched?.yarnId === yarnId ? fetched.colourways : [];
}
