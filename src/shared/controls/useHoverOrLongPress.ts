import { MouseEvent, PointerEvent, useRef } from 'react';

export const LONG_PRESS_MS = 500;

export type PressPosition = Pick<
  MouseEvent<Element>,
  'currentTarget' | 'clientX' | 'clientY'
>;

export const isTouch = (event: PointerEvent<Element>) =>
  event.pointerType === 'touch';

type HoverOrLongPressCallbacks = {
  onShow: (position: PressPosition) => void;
  onHide: () => void;
};

export function useHoverOrLongPress({
  onShow,
  onHide,
}: HoverOrLongPressCallbacks) {
  const pressTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isTouchPress = useRef(false);
  const wasLongPress = useRef(false);

  const cancelPress = () => clearTimeout(pressTimer.current);

  return {
    // Touch fires pointerenter on touch down and pointerleave on lift, so
    // hover only counts for mouse and pen.
    onPointerEnter: (event: PointerEvent<Element>) => {
      if (!isTouch(event)) onShow(event);
    },
    onPointerLeave: (event: PointerEvent<Element>) => {
      if (!isTouch(event)) onHide();
    },
    onPointerDown: (event: PointerEvent<Element>) => {
      isTouchPress.current = isTouch(event);
      wasLongPress.current = false;
      if (!isTouchPress.current) return;

      const { currentTarget, clientX, clientY } = event;
      pressTimer.current = setTimeout(() => {
        wasLongPress.current = true;
        onShow({ currentTarget, clientX, clientY });
        document.addEventListener('pointerdown', onHide, {
          once: true,
          capture: true,
        });
      }, LONG_PRESS_MS);
    },
    onPointerUp: cancelPress,
    onPointerCancel: cancelPress,
    // Cancelling a touch contextmenu also stops Android selecting text or
    // opening its own long-press menu.
    onContextMenu: (event: MouseEvent<Element>) => {
      if (isTouchPress.current) event.preventDefault();
    },
    onClickCapture: (event: MouseEvent<Element>) => {
      if (wasLongPress.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
  };
}
