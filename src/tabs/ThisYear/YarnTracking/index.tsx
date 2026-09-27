import { useState } from 'react';
import { getThisYear } from '../../../shared/dates';
import { YarnTrackingForm } from './Form';
import { YarnBalance } from './YarnBalance';
import { YarnState } from './YarnState';
import { YarnStorageProvider, useYarnYears } from './YarnStorageContext';
import { YearTabs } from './YearTabs';

function YarnYears() {
  const thisYear = getThisYear();
  const years = useYarnYears();
  const [selectedYear, setSelectedYear] = useState(thisYear);

  return (
    <YearTabs
      years={years}
      selectedYear={selectedYear}
      onSelectYear={setSelectedYear}
    >
      <div
        key={selectedYear}
        style={{
          padding: '60px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <YarnState year={selectedYear} />
        <div
          style={{
            marginInline: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <YarnBalance year={selectedYear} />
          {selectedYear === thisYear && <YarnTrackingForm />}
        </div>
      </div>
    </YearTabs>
  );
}

export function YarnTracking() {
  return (
    <YarnStorageProvider>
      <YarnYears />
    </YarnStorageProvider>
  );
}
