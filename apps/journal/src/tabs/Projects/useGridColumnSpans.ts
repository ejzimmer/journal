import { RefObject, useLayoutEffect } from 'react';
import { Category, ProjectDetails } from '../../types';

const SHOWN_ITEM = '.project-item:not(.filtered-out)';
const RESIZABLE_PARTS = [
  `${SHOWN_ITEM} > .project`,
  `${SHOWN_ITEM} .project-main-row`,
  `${SHOWN_ITEM} .project-name`,
].join(', ');

type ShownProjects = {
  projects: ProjectDetails[];
  filter: Category[];
  year: number;
};

function fitColumnSpansToContent(list: HTMLElement) {
  const style = getComputedStyle(list);
  const columnUnit = parseFloat(style.getPropertyValue('--grid-unit'));
  const gap = parseFloat(style.getPropertyValue('--shelf-gap'));
  const items = [...list.querySelectorAll<HTMLElement>(SHOWN_ITEM)];

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

export function useGridColumnSpans(
  listRef: RefObject<HTMLElement | null>,
  { projects, filter, year }: ShownProjects,
) {
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    fitColumnSpansToContent(list);

    let cancelled = false;
    let frame = 0;

    document.fonts?.ready.then(() => {
      if (!cancelled) fitColumnSpansToContent(list);
    });

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        cancelled = true;
      };
    }

    const resizeObserver = new ResizeObserver(() => measureOnNextFrame());
    const observeResizableParts = () =>
      list
        .querySelectorAll(RESIZABLE_PARTS)
        .forEach((part) => resizeObserver.observe(part));

    const measureOnNextFrame = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (cancelled) return;
        fitColumnSpansToContent(list);
        // A `.project-name` is replaced by a textarea while it's being edited,
        // without re-rendering this list, so the parts are looked up again.
        observeResizableParts();
      });
    };

    observeResizableParts();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [listRef, projects, filter, year]);
}
