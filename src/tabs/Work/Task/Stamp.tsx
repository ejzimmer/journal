import { ClockIcon } from '../../../shared/icons/Clock';
import { HammerIcon } from '../../../shared/icons/Hammer';
import { MergeIcon } from '../../../shared/icons/Merge';
import { PersonIcon } from '../../../shared/icons/Person';
import { Blocker } from '../types';
import './Stamp.css';

const BLOCKER_ICONS = {
  merge_queue: MergeIcon,
  build: HammerIcon,
  human: PersonIcon,
  time: ClockIcon,
};

type StampProps = {
  blocker?: Blocker;
};

export function Stamp({ blocker }: StampProps) {
  const Icon = blocker && BLOCKER_ICONS[blocker];

  return (
    <span className={`stamp ${blocker ?? 'blank'}`}>{Icon && <Icon />}</span>
  );
}
