import { EmojiCheckbox } from '../../../shared/controls/EmojiCheckbox';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';
import { bikePictures } from './BikePictures/bikePictures';
import { Bike } from './types';

type BikeTileProps = {
  bike: Bike;
  onChange: (isDone: boolean) => void;
};

export function BikeTile({ bike, onChange }: BikeTileProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover();

  return (
    <li {...triggerProps}>
      <EmojiCheckbox
        emoji={bikePictures[bike.name] ?? bike.icon}
        isChecked={bike.isDone}
        onChange={(event) => onChange(event.target.checked)}
        label={bike.name}
      />
      <div className="tooltip bike-name" {...tooltipProps}>
        {bike.name}
      </div>
    </li>
  );
}
