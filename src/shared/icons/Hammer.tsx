import { IconProps } from './types';

export function HammerIcon({ colour = 'currentColor', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="100%"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      {...props}
    >
      <g transform="rotate(45 10 10)">
        <path d="M4,3 H14 L16,4.5 V7 H4 Z" fill={colour} />
        <path d="M10,7 V18.5" />
      </g>
    </svg>
  );
}
