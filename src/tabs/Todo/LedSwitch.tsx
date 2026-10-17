import { Switch, SwitchProps } from '../../shared/controls/Switch';

import './LedSwitch.css';

type LedSwitchProps<T extends string> = Omit<SwitchProps<T>, 'className'>;

export function LedSwitch<T extends string>(props: LedSwitchProps<T>) {
  return <Switch {...props} className="led-switch" />;
}
