import { useEffect, useEffectEvent } from 'react';

import { fetchColourwayColour } from '../ravelry/fetchColourwayColour';
import { ColourwayDraft } from './projectDraft';

export function useColourwayColour(
  colourway: ColourwayDraft,
  onChange: (colourway: ColourwayDraft) => void,
) {
  const { photoUrl, colour } = colourway;

  const saveColour = useEffectEvent((foundColour: string) =>
    onChange({ ...colourway, colour: foundColour }),
  );

  useEffect(() => {
    if (!photoUrl || colour) return;

    const controller = new AbortController();
    fetchColourwayColour(photoUrl, controller.signal)
      .then(saveColour)
      .catch(() => {});

    return () => controller.abort();
  }, [photoUrl, colour]);
}
