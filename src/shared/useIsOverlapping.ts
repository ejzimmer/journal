import { RefObject, useEffect, useState } from 'react';

export function useIsOverlapping(
  overlayRef: RefObject<HTMLElement | null>,
  underlayRef: RefObject<HTMLElement | null>,
) {
  const [isOverlapping, setIsOverlapping] = useState(false);

  useEffect(() => {
    const overlay = overlayRef.current;
    const underlay = underlayRef.current;
    if (!overlay || !underlay || typeof ResizeObserver === 'undefined') return;

    const measureOverlap = () => {
      const lastItem = underlay.lastElementChild ?? underlay;
      setIsOverlapping(
        lastItem.getBoundingClientRect().right >
          overlay.getBoundingClientRect().left,
      );
    };

    const observer = new ResizeObserver(measureOverlap);
    observer.observe(underlay);
    observer.observe(overlay);
    return () => observer.disconnect();
  });

  return isOverlapping;
}
