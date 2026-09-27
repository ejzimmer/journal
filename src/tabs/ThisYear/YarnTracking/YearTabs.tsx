import { KeyboardEvent, ReactNode, useRef } from 'react';
import './YearTabs.css';

type YearTabsProps = {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  children: ReactNode;
};

const getTabId = (year: number) => `yarn-year-tab-${year}`;
const PANEL_ID = 'yarn-year-panel';

export function YearTabs({
  years,
  selectedYear,
  onSelectYear,
  children,
}: YearTabsProps) {
  const tabRefs = useRef(new Map<number, HTMLButtonElement>());

  if (years.length < 2) {
    return children;
  }

  const selectTab = (year: number) => {
    onSelectYear(year);
    tabRefs.current.get(year)?.focus();
  };

  const moveSelection = (event: KeyboardEvent) => {
    const index = years.indexOf(selectedYear);
    const targetIndex = {
      ArrowLeft: index - 1,
      ArrowRight: index + 1,
      Home: 0,
      End: years.length - 1,
    }[event.key];

    if (targetIndex === undefined) return;

    event.preventDefault();
    selectTab(years[(targetIndex + years.length) % years.length]);
  };

  return (
    <div className="year-tabs">
      <div role="tablist" aria-label="Year" onKeyDown={moveSelection}>
        {years.map((year) => {
          const isSelected = year === selectedYear;
          return (
            <button
              key={year}
              ref={(element) => {
                if (element) tabRefs.current.set(year, element);
                else tabRefs.current.delete(year);
              }}
              type="button"
              role="tab"
              id={getTabId(year)}
              aria-selected={isSelected}
              aria-controls={PANEL_ID}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => onSelectYear(year)}
            >
              {year}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={PANEL_ID}
        aria-labelledby={getTabId(selectedYear)}
      >
        {children}
      </div>
    </div>
  );
}
