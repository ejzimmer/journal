import { EmojiCheckbox } from '../../../shared/controls/EmojiCheckbox';
import { bikePictures } from './BikePictures/bikePictures';
import { Bike } from './types';

type BikeGridProps = {
  bikes: Bike[];
  onBikeChange: (index: number, isDone: boolean) => void;
};

export function BikeGrid({ bikes, onBikeChange }: BikeGridProps) {
  return (
    <ul className="bike-grid">
      {bikes.map((bike, index) => (
        <li key={bike.name}>
          <EmojiCheckbox
            emoji={bikePictures[bike.name] ?? bike.icon}
            isChecked={bike.isDone}
            onChange={(event) => onBikeChange(index, event.target.checked)}
            label={bike.name}
          />
          <div>{bike.name}</div>
        </li>
      ))}
    </ul>
  );
}
