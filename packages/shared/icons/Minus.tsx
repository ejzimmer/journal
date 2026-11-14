import { IconProps } from './types';

export function MinusIcon({ colour = 'currentColor', ...props }: IconProps) {
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
      <line x1="4" y1="10" x2="16" y2="10" />
    </svg>
  );
}
