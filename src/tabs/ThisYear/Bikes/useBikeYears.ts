import { useStorageContext } from '../../../shared/FirebaseContext';
import { BIKES_PATH, Bike, StoredBikesByYear, getBikesPath } from './types';

const createUnriddenBikes = (bikes: Bike[] = []) =>
  bikes.map((bike) => ({ ...bike, isDone: false }));

export function useBikeYears() {
  const { useValue, setValue } = useStorageContext();
  const { value: storedBikesByYear = {} } =
    useValue<StoredBikesByYear>(BIKES_PATH);

  const latestYear = Math.max(...Object.keys(storedBikesByYear).map(Number));

  const getBikes = (year: number) =>
    storedBikesByYear[year] ??
    createUnriddenBikes(storedBikesByYear[latestYear]);

  const setBikeDone = (year: number, index: number, isDone: boolean) => {
    const bikes = getBikes(year);
    setValue(
      getBikesPath(year),
      bikes.with(index, { ...bikes[index], isDone }),
    );
  };

  return { getBikes, setBikeDone };
}
