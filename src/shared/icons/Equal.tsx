import { IconProps } from './types';

export function EqualIcon({ colour = 'currentColor', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      width="100%"
      fill="none"
      {...props}
    >
      <path d="M3,7 L17,7" />
      <path d="M3,13 L17,13" />
    </svg>
  );
}
