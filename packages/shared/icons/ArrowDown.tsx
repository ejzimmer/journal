import { IconProps } from './types';

export function ArrowDownIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      fill="none"
      {...props}
    >
      <path d="M3,12 L10,18 17,12" />
      <path d="M10,2 L10,18" />
    </svg>
  );
}
