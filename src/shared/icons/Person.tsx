import { IconProps } from './types';

export function PersonIcon({ colour = 'currentColor', ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="100%"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      {...props}
    >
      <circle cx="10" cy="6" r="3.5" />
      <path d="M3.5,18 C3.5,11 16.5,11 16.5,18" />
    </svg>
  );
}
