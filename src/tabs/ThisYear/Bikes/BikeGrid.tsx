import { BikeTile } from './BikeTile';
import { Bike } from './types';

type BikeGridProps = {
  bikes: Bike[];
  onBikeChange: (index: number, isDone: boolean) => void;
};

export function BikeGrid({ bikes, onBikeChange }: BikeGridProps) {
  return (
    <ul className="bike-grid">
      {bikes.map((bike, index) => (
        <BikeTile
          key={bike.name}
          bike={bike}
          onChange={(isDone) => onBikeChange(index, isDone)}
        />
      ))}
    </ul>
  );
}
