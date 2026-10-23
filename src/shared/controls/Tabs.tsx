import { KeyboardEvent, ReactNode, useId, useRef } from 'react';
import './Tabs.css';

export type Tab<T extends string | number> = {
  id: T;
  label: ReactNode;
  className?: string;
};

type TabsProps<T extends string | number> = {
  tabs: Tab<T>[];
  selectedTab: T;
  onSelectTab: (id: T) => void;
  label: string;
  className?: string;
  children: ReactNode;
};

export function Tabs<T extends string | number>({
  tabs,
  selectedTab,
  onSelectTab,
  label,
  className,
  children,
}: TabsProps<T>) {
  const tabRefs = useRef(new Map<T, HTMLButtonElement>());
  const idPrefix = useId();
  const getTabId = (id: T) => `${idPrefix}-tab-${id}`;
  const panelId = `${idPrefix}-panel`;

  if (tabs.length < 2) {
    return children;
  }

  const selectTab = (id: T) => {
    onSelectTab(id);
    tabRefs.current.get(id)?.focus();
  };

  const moveSelection = (event: KeyboardEvent) => {
    const index = tabs.findIndex(({ id }) => id === selectedTab);
    const targetIndex = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];

    if (targetIndex === undefined) return;

    event.preventDefault();
    selectTab(tabs[(targetIndex + tabs.length) % tabs.length].id);
  };

  return (
    <div className={`tabs ${className ?? ''}`}>
      <div role="tablist" aria-label={label} onKeyDown={moveSelection}>
        {tabs.map((tab) => {
          const isSelected = tab.id === selectedTab;
          return (
            <button
              key={tab.id}
              ref={(element) => {
                if (element) tabRefs.current.set(tab.id, element);
                else tabRefs.current.delete(tab.id);
              }}
              type="button"
              role="tab"
              id={getTabId(tab.id)}
              className={tab.className}
              aria-selected={isSelected}
              aria-controls={panelId}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectTab(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={panelId} aria-labelledby={getTabId(selectedTab)}>
        {children}
      </div>
    </div>
  );
}
