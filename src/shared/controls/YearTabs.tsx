import { ReactNode } from 'react';
import { Tabs } from './Tabs';

type YearTabsProps = {
  years: number[];
  selectedYear: number;
  onSelectYear: (year: number) => void;
  className?: string;
  children: ReactNode;
};

export function YearTabs({
  years,
  selectedYear,
  onSelectYear,
  className,
  children,
}: YearTabsProps) {
  return (
    <Tabs
      tabs={years.map((year) => ({ id: year, label: year }))}
      selectedTab={selectedYear}
      onSelectTab={onSelectYear}
      label="Year"
      className={`year-tabs ${className ?? ''}`}
    >
      {children}
    </Tabs>
  );
}
