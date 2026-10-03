import { IconProps } from './types';

const BAR_POSITIONS = [2.5, 7.5, 12.5];

export function StackedBarsIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill={colour} width="100%" {...props}>
      {BAR_POSITIONS.map((y) => (
        <rect key={y} x="2" y={y} width="14" height="3" rx="1.5" />
      ))}
    </svg>
  );
}
