import { useState } from 'react';
import { getThisYear } from '../../../shared/dates';
import { YearTabs } from '../../../shared/controls/YearTabs';
import { BikeGrid } from './BikeGrid';
import { useBikeYears } from './useBikeYears';

import './Bikes.css';

export function Bikes() {
  const { years, getBikes, setBikeDone } = useBikeYears();
  const [selectedYear, selectYear] = useState(getThisYear);

  return (
    <section className="bikes" aria-label="Bikes">
      <YearTabs
        years={years}
        selectedYear={selectedYear}
        onSelectYear={selectYear}
        className="bike-year-tabs"
      >
        <BikeGrid
          bikes={getBikes(selectedYear)}
          onBikeChange={(index, isDone) =>
            setBikeDone(selectedYear, index, isDone)
          }
        />
      </YearTabs>
    </section>
  );
}
