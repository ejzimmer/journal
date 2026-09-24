import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { ProjectSubtask } from '../../shared/types';

type DrawerParams = {
  drawerRef: RefObject<HTMLDivElement | null>;
  listRef: RefObject<HTMLOListElement | null>;
  formRef: RefObject<HTMLDivElement | null>;
  subtasks: ProjectSubtask[];
  isProjectLoaded: boolean;
  isOpen: boolean;
  isFormOpen: boolean;
};

export function useDrawer({
  drawerRef,
  listRef,
  formRef,
  subtasks,
  isProjectLoaded,
  isOpen,
  isFormOpen,
}: DrawerParams) {
  const [openHeight, setOpenHeight] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasScrolledIntoView = useRef(false);

  const height = isOpen ? openHeight : 0;
  const lastRenderedHeight = useRef(height);

  const measureDrawerHeight = useCallback(() => {
    if (!listRef.current || !formRef.current) return;

    setOpenHeight(listRef.current.clientHeight + formRef.current.clientHeight);
  }, [listRef, formRef]);

  useEffect(() => {
    measureDrawerHeight();
  }, [measureDrawerHeight, subtasks, isProjectLoaded, isFormOpen]);

  useLayoutEffect(() => {
    if (lastRenderedHeight.current === height) return;
    lastRenderedHeight.current = height;

    setIsAnimating(true);
  }, [height]);

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
  }, [drawerRef, isProjectLoaded]);

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
