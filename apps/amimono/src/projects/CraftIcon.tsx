import { CRAFTS } from './crafts';
import { Craft } from './types';

type CraftIconProps = {
  craft: Craft;
};

export function CraftIcon({ craft }: CraftIconProps) {
  const { label, Icon } = CRAFTS[craft];

  return (
    <span className="craft-icon" role="img" aria-label={label} title={label}>
      <Icon />
    </span>
  );
}
