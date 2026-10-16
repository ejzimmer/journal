import { RefObject, useLayoutEffect } from 'react';

export function useAutoHeight(ref: RefObject<HTMLTextAreaElement | null>) {
  useLayoutEffect(() => {
    const textarea = ref.current;
    if (!textarea || CSS.supports?.('field-sizing', 'content')) {
      return;
    }

    textarea.style.height = 'auto';
    const { borderTopWidth, borderBottomWidth } = getComputedStyle(textarea);
    const borders = parseFloat(borderTopWidth) + parseFloat(borderBottomWidth);
    textarea.style.height = `${textarea.scrollHeight + borders}px`;
  });
}
