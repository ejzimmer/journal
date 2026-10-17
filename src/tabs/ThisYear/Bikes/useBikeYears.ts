import { useStorageContext } from '../../../shared/FirebaseContext';
import { getThisYear } from '../../../shared/dates';
import { sortYearsByNewest } from '../../../shared/years';
import { BIKES_PATH, Bike, StoredBikesByYear, getBikesPath } from './types';

const createUnriddenBikes = (bikes: Bike[] = []) =>
  bikes.map((bike) => ({ ...bike, isDone: false }));

export function useBikeYears() {
  const { useValue, setValue } = useStorageContext();
  const { value: storedBikesByYear = {} } =
    useValue<StoredBikesByYear>(BIKES_PATH);

  const years = sortYearsByNewest(
    getThisYear(),
    Object.keys(storedBikesByYear).map(Number),
  );
  const latestBikes = years
    .map((year) => storedBikesByYear[year])
    .find(Boolean);

  const getBikes = (year: number) =>
    storedBikesByYear[year] ?? createUnriddenBikes(latestBikes);

  const setBikeDone = (year: number, index: number, isDone: boolean) => {
    const bikes = getBikes(year);
    setValue(
      getBikesPath(year),
      bikes.with(index, { ...bikes[index], isDone }),
    );
  };

  return { years, getBikes, setBikeDone };
}
