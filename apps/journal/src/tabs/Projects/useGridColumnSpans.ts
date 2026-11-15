import {
  RefCallback,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { Category, ProjectDetails } from '../../types';

type ShownProjects = {
  projects: ProjectDetails[];
  filter: Category[];
  year: number;
};

function fitColumnSpansToContent(items: HTMLElement[]) {
  if (items.length === 0) return;

  const style = getComputedStyle(items[0]);
  const columnUnit = parseFloat(style.getPropertyValue('--grid-unit'));
  const gap = parseFloat(style.getPropertyValue('--shelf-gap'));

  // Reading the size immediately after updating it forces a synchronous
  // layout of the whole grid. Doing all the writes before any of the reads
  // ensures this layout only happens once.
  items.forEach((item) => (item.style.width = 'max-content'));
  const naturalWidths = items.map((item) => item.getBoundingClientRect().width);
  items.forEach((item) => (item.style.width = ''));

  items.forEach((item, index) => {
    const columnSpan = String(
      Math.max(1, Math.ceil((naturalWidths[index] + gap) / (columnUnit + gap))),
    );
    if (item.style.getPropertyValue('--col-span') !== columnSpan) {
      item.style.setProperty('--col-span', columnSpan);
    }
  });
}

function createColumnSpanFitter() {
  const items = new Set<HTMLElement>();
  let frame = 0;

  const fitNow = () => fitColumnSpansToContent([...items]);
  const fitOnNextFrame = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(fitNow);
  };
  const resizeObserver = new ResizeObserver(fitOnNextFrame);

  return {
    fitNow,
    cancelPendingFit: () => cancelAnimationFrame(frame),
    addItem: (item: HTMLElement) => {
      items.add(item);
    },
    removeItem: (item: HTMLElement) => {
      items.delete(item);
    },
    refitOnResize: (element: HTMLElement) => resizeObserver.observe(element),
    stopRefittingOnResize: (element: HTMLElement) =>
      resizeObserver.unobserve(element),
  };
}

export function useGridColumnSpans({ projects, filter, year }: ShownProjects) {
  const [fitter] = useState(createColumnSpanFitter);

  useLayoutEffect(() => {
    fitter.fitNow();
  }, [fitter, projects, filter, year]);

  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) fitter.fitNow();
    });

    return () => {
      cancelled = true;
      fitter.cancelPendingFit();
    };
  }, [fitter]);

  const itemRef: RefCallback<HTMLElement> = useCallback(
    (item) => {
      if (!item) return;

      fitter.addItem(item);
      return () => fitter.removeItem(item);
    },
    [fitter],
  );
  const resizableContentRef: RefCallback<HTMLElement> = useCallback(
    (element) => {
      if (!element) return;

      fitter.refitOnResize(element);
      return () => fitter.stopRefittingOnResize(element);
    },
    [fitter],
  );

  return { itemRef, resizableContentRef };
}
