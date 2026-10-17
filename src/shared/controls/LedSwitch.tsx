import { Switch, SwitchProps } from './Switch';

import './LedSwitch.css';

type LedSwitchProps<T extends string> = Omit<
  SwitchProps<T>,
  'className' | 'indicatorClassName'
>;

export function LedSwitch<T extends string>(props: LedSwitchProps<T>) {
  return <Switch {...props} className="led-switch" indicatorClassName="led" />;
}
