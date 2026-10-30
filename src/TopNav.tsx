import { useCallback, useEffect, useRef } from 'react';
import { TABS } from './tabConfig';
import { NavItem } from './NavItem';
import { AppUpdateButton } from './shared/AppUpdateButton';
import { TabOverflowMenu } from './TabOverflowMenu';
import { useVisibleTabCount } from './useVisibleTabCount';

export function TopNav() {
  const navListRef = useRef<HTMLUListElement>(null);
  const visibleTabCount = useVisibleTabCount(navListRef, TABS.length);

  const hideHighlight = useCallback(() => {
    if (!navListRef.current) return;
    navListRef.current.style = `--hover-width: 0px`;
  }, []);

  useEffect(() => {
    if (!navListRef.current) return;

    const tabElements = navListRef.current.children;
    const listElement = navListRef.current;

    const onMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX;
      const hoveredTab = Array.from(tabElements).find((tab) => {
        const { x, width } = tab.getBoundingClientRect();
        return (
          x < mouseX && x + width >= mouseX && !tab.classList.contains('unused')
        );
      });

      moveHighlight(hoveredTab);
    };

    navListRef.current.addEventListener('mousemove', onMouseMove);
    navListRef.current.addEventListener('mouseleave', hideHighlight);

    return () => {
      listElement.removeEventListener('mousemove', onMouseMove);
      listElement.removeEventListener('mouseleave', hideHighlight);
    };
  }, [hideHighlight]);

  const moveHighlight = (hoveredTab?: Element | null) => {
    if (!hoveredTab || !navListRef.current) return;

    const { x, width } = hoveredTab.getBoundingClientRect();
    navListRef.current.style = `--hover-left: ${x}px; --hover-width: ${width}px`;
  };

  return (
    <nav className="tabs">
      <ul ref={navListRef} onBlur={hideHighlight}>
        {TABS.map(({ path }, index) => (
          <NavItem
            key={path}
            to={path}
            isHidden={index >= visibleTabCount}
            onFocus={(event) => moveHighlight(event.target.parentElement)}
          >
            {path}
          </NavItem>
        ))}
        <TabOverflowMenu
          paths={TABS.slice(visibleTabCount).map(({ path }) => path)}
        />
      </ul>
      <AppUpdateButton tabListRef={navListRef} />
    </nav>
  );
}
