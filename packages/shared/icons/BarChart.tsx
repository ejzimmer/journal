import { IconProps } from './types';

export function BarChartIcon({ colour = 'currentColor', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill={colour} width="100%" {...props}>
      <rect x="2" y="9" width="3" height="7" rx="1" />
      <rect x="7.5" y="5" width="3" height="11" rx="1" />
      <rect x="13" y="2" width="3" height="14" rx="1" />
    </svg>
  );
}
