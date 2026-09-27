import { YarnTrackingForm } from './Form';
import { YarnBalance } from './YarnBalance';
import { YarnState } from './YarnState';
import {
  YarnStorageProvider,
  useYarnStorageContext,
} from './YarnStorageContext';
import { YearTabs } from './YearTabs';

function YarnYears() {
  const { years, thisYear, selectedYear, selectYear } = useYarnStorageContext();

  return (
    <YearTabs
      years={years}
      selectedYear={selectedYear}
      onSelectYear={selectYear}
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
