import { IconProps } from './types';

export function MergeIcon({ colour = 'currentColor', ...props }: IconProps) {
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
      <circle cx="6" cy="4" r="2" />
      <circle cx="6" cy="16" r="2" />
      <circle cx="15" cy="10" r="2" />
      <path d="M6,6 V14" />
      <path d="M6,6 C6,10 9,10 13,10" />
    </svg>
  );
}
