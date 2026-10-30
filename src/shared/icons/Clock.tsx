import { IconProps } from './types';

export function ClockIcon({ colour = 'currentColor', ...props }: IconProps) {
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
      <circle cx="10" cy="10" r="8.5" />
      <path d="M10,5 V10 L13.5,12" />
    </svg>
  );
}
