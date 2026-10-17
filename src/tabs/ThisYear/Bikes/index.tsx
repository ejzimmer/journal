import { getThisYear } from '../../../shared/dates';
import { BikeGrid } from './BikeGrid';
import { useBikeYears } from './useBikeYears';
import { useBikesMigration } from './useBikesMigration';

import './Bikes.css';

export function Bikes() {
  useBikesMigration();
  const { getBikes, setBikeDone } = useBikeYears();
  const thisYear = getThisYear();

  return (
    <section className="bikes" aria-label="Bikes">
      <BikeGrid
        bikes={getBikes(thisYear)}
        onBikeChange={(index, isDone) => setBikeDone(thisYear, index, isDone)}
      />
    </section>
  );
}
