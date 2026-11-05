import { EmojiCheckbox } from '../../../shared/controls/EmojiCheckbox';
import { Tooltip } from '../../../shared/controls/Tooltip';
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
        <Tooltip key={bike.name} label={bike.name} position="top-right">
          {(triggerProps) => (
            <li {...triggerProps}>
              <EmojiCheckbox
                emoji={bikePictures[bike.name] ?? bike.icon}
                isChecked={bike.isDone}
                onChange={(event) => onBikeChange(index, event.target.checked)}
                label={bike.name}
              />
            </li>
          )}
        </Tooltip>
      ))}
    </ul>
  );
}
