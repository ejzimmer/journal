import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
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
  const [isCollapsing, setIsCollapsing] = useState(false);
  const hasScrolledIntoView = useRef(false);
  const wasOpen = useRef(isOpen);

  const measureDrawer = useCallback(() => {
    const drawer = drawerRef.current;
    if (!drawer || !listRef.current || !formRef.current) return;

    const card = drawer.parentElement;
    if (!card) return;

    card.style.removeProperty('--drawer-content-width');
    drawer.classList.add('measuring');
    drawer.style.width = 'max-content';

    const contentWidth = Math.ceil(drawer.getBoundingClientRect().width);
    setOpenHeight(listRef.current.clientHeight + formRef.current.clientHeight);

    drawer.style.width = '';
    drawer.classList.remove('measuring');
    card.style.setProperty('--drawer-content-width', `${contentWidth}px`);
  }, [drawerRef, listRef, formRef]);

  useEffect(() => {
    measureDrawer();
  }, [measureDrawer, subtasks, isProjectLoaded, isFormOpen]);

  useEffect(() => {
    if (wasOpen.current === isOpen) return;
    wasOpen.current = isOpen;

    setIsCollapsing(!isOpen && openHeight > 0);
  }, [isOpen, openHeight]);

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    const remeasureWhenFormSettles = (event: TransitionEvent) => {
      if (event.propertyName === 'min-width') measureDrawer();
    };

    const stopCollapsingWhenClosed = (event: TransitionEvent) => {
      if (event.target === drawer && event.propertyName === 'height') {
        setIsCollapsing(false);
      }
    };

    drawer.addEventListener('transitionend', remeasureWhenFormSettles);
    drawer.addEventListener('transitionend', stopCollapsingWhenClosed);
    return () => {
      drawer.removeEventListener('transitionend', remeasureWhenFormSettles);
      drawer.removeEventListener('transitionend', stopCollapsingWhenClosed);
    };
  }, [drawerRef, measureDrawer, isProjectLoaded]);

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

  return { height: isOpen ? openHeight : 0, isRaised: isOpen || isCollapsing };
}
