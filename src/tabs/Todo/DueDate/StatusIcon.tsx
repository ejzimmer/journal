import { CalendarTask } from '../../../shared/types';
import { PlayButtonIcon } from '../../../shared/icons/PlayButton';
import { PauseButtonIcon } from '../../../shared/icons/PauseButton';
import { TickIcon } from '../../../shared/icons/Tick';
import { IconProps } from '../../../shared/icons/types';

const statusIconMapping: Record<CalendarTask['status'], React.FC<IconProps>> = {
  ready: PlayButtonIcon,
  paused: PauseButtonIcon,
  finished: TickIcon,
};

type StatusIconProps = { value: CalendarTask['status'] };

export function StatusIcon({ value }: StatusIconProps) {
  const Icon = statusIconMapping[value];
  return <Icon colour="currentColor" width="12px" />;
}
