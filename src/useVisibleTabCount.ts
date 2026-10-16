import { RefObject, useLayoutEffect, useRef, useState } from 'react';

export function useVisibleTabCount(
  listRef: RefObject<HTMLUListElement | null>,
  tabCount: number,
) {
  const [visibleTabCount, setVisibleTabCount] = useState(tabCount);
  const itemWidthsRef = useRef<number[]>([]);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || typeof ResizeObserver === 'undefined') return;

    const updateVisibleTabCount = () => {
      const itemWidths = itemWidthsRef.current;
      Array.from(list.children).forEach((item, index) => {
        const { width } = item.getBoundingClientRect();
        if (width > 0) itemWidths[index] = width;
      });

      setVisibleTabCount(
        countTabsThatFit(
          itemWidths.slice(0, tabCount),
          itemWidths[tabCount] ?? 0,
          list.clientWidth,
        ),
      );
    };

    const observer = new ResizeObserver(updateVisibleTabCount);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef, tabCount]);

  return visibleTabCount;
}

function countTabsThatFit(
  tabWidths: number[],
  menuWidth: number,
  availableWidth: number,
) {
  const totalWidth = tabWidths.reduce((sum, width) => sum + width, 0);
  if (totalWidth <= availableWidth) return tabWidths.length;

  let usedWidth = menuWidth;
  let count = 0;
  while (
    count < tabWidths.length &&
    usedWidth + tabWidths[count] <= availableWidth
  ) {
    usedWidth += tabWidths[count];
    count++;
  }
  return count;
}
