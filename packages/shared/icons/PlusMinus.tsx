import { IconProps } from './types';

export function PlusMinusIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      strokeLinecap="round"
      width="100%"
      stroke={colour}
      strokeWidth="2"
      fill="none"
      {...props}
    >
      <line x1="10" y1="2" x2="10" y2="12" />
      <line x1="5" y1="7" x2="15" y2="7" />
      <line x1="5" y1="17" x2="15" y2="17" />
    </svg>
  );
}
