import { useCallback, useEffect, useState } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { getThisYear } from '../../../shared/dates';
import { YarnTrackingForm } from './Form';
import { YarnBalance } from './YarnBalance';
import { YarnState } from './YarnState';
import { YarnStorageProvider } from './YarnStorageContext';
import { YearTabs } from './YearTabs';
import { FIRST_YARN_YEAR, StoredYarn, getYarnPath } from './types';

const listYearsSinceFirstYarn = (thisYear: number) =>
  Array.from(
    { length: thisYear - FIRST_YARN_YEAR + 1 },
    (_, index) => thisYear - index,
  );

type YarnYearProbeProps = {
  year: number;
  onChange: (year: number, hasYarn: boolean) => void;
};

function YarnYearProbe({ year, onChange }: YarnYearProbeProps) {
  const { useValue } = useStorageContext();
  const { value } = useValue<StoredYarn>(getYarnPath(year));
  const hasYarn = Boolean(value);

  useEffect(() => {
    onChange(year, hasYarn);
  }, [year, hasYarn, onChange]);

  return null;
}

export function YarnTracking() {
  const [thisYear] = useState(getThisYear);
  const [selectedYear, setSelectedYear] = useState(thisYear);
  const [yearsWithYarn, setYearsWithYarn] = useState(() => new Set<number>());

  const updateYearWithYarn = useCallback((year: number, hasYarn: boolean) => {
    setYearsWithYarn((years) => {
      if (years.has(year) === hasYarn) return years;
      const updated = new Set(years);
      if (hasYarn) updated.add(year);
      else updated.delete(year);
      return updated;
    });
  }, []);

  const earlierYears = listYearsSinceFirstYarn(thisYear).slice(1);
  const tabYears = [
    thisYear,
    ...earlierYears.filter((year) => yearsWithYarn.has(year)),
  ];

  return (
    <>
      {earlierYears.map((year) => (
        <YarnYearProbe key={year} year={year} onChange={updateYearWithYarn} />
      ))}
      <YearTabs
        years={tabYears}
        selectedYear={selectedYear}
        onSelectYear={setSelectedYear}
      >
        <YarnStorageProvider key={selectedYear} year={selectedYear}>
          <div
            style={{
              padding: '60px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <YarnState />
            <div
              style={{
                marginInline: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <YarnBalance />
              {selectedYear === thisYear && <YarnTrackingForm />}
            </div>
          </div>
        </YarnStorageProvider>
      </YearTabs>
    </>
  );
}
