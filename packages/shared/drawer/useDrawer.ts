import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type DrawerParams = {
  drawerRef: RefObject<HTMLDivElement | null>;
  contentRef: RefObject<HTMLDivElement | null>;
  isOpen: boolean;
};

export function useDrawer({ drawerRef, contentRef, isOpen }: DrawerParams) {
  const [openHeight, setOpenHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasScrolledIntoView = useRef(false);

  const height = isOpen ? openHeight : 0;
  const [previousHeight, setPreviousHeight] = useState(height);

  if (height !== previousHeight) {
    setPreviousHeight(height);

    const isResizingOpenDrawer = previousHeight > 0 && height > 0;
    if (!isResizingOpenDrawer) {
      setIsAnimating(true);
    }
  }

  const measureContentHeight = useCallback(() => {
    if (!contentRef.current) return;
    setOpenHeight(contentRef.current.offsetHeight);
  }, [contentRef]);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    measureContentHeight();
    const observer = new ResizeObserver(measureContentHeight);
    observer.observe(content);
    return () => observer.disconnect();
  }, [contentRef, measureContentHeight]);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const stopAnimatingWhenSettled = (event: TransitionEvent) => {
      if (event.target === drawer && event.propertyName === 'height') {
        setIsAnimating(false);
      }
    };

    drawer.addEventListener('transitionend', stopAnimatingWhenSettled);
    return () => {
      drawer.removeEventListener('transitionend', stopAnimatingWhenSettled);
    };
  }, [drawerRef]);

  useEffect(() => {
    if (!isOpen) {
      hasScrolledIntoView.current = false;
      return;
    }

    const drawer = drawerRef.current;
    if (hasScrolledIntoView.current || !openHeight || !drawer) return;
    hasScrolledIntoView.current = true;

    const cardTop = drawer.parentElement?.getBoundingClientRect().top ?? 0;
    const hiddenBelowFold =
      drawer.getBoundingClientRect().top + openHeight - window.innerHeight;

    if (hiddenBelowFold > 0) {
      window.scrollBy({
        top: Math.min(hiddenBelowFold, cardTop),
        behavior: 'smooth',
      });
    }
  }, [drawerRef, isOpen, openHeight]);

  return {
    height,
    isRaised: isOpen || isAnimating,
    isSettled: isOpen && !isAnimating,
  };
}
