import { useEffect, useRef } from 'react';

import { fetchColourwayColour } from '../ravelry/fetchColourwayColour';
import { ColourwayDraft } from './projectDraft';

export function useColourwayColour(
  colourway: ColourwayDraft,
  onChange: (colourway: ColourwayDraft) => void,
) {
  const latest = useRef({ colourway, onChange });
  useEffect(() => {
    latest.current = { colourway, onChange };
  });

  const { photoUrl, colour } = colourway;
  useEffect(() => {
    if (!photoUrl || colour) return;

    const controller = new AbortController();
    fetchColourwayColour(photoUrl, controller.signal)
      .then((foundColour) => {
        const { colourway: current, onChange: updateColourway } =
          latest.current;
        if (current.photoUrl === photoUrl) {
          updateColourway({ ...current, colour: foundColour });
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [photoUrl, colour]);
}
