import { IconProps } from './types';

export function ChevronDownIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      fill="none"
      {...props}
    >
      <path d="M3,10 L10,16 17,10" />
    </svg>
  );
}
