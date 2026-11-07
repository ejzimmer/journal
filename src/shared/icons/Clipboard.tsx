import { IconProps } from './types';

export function ClipboardIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 22.5 22"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      fill="none"
      {...props}
    >
      <path d="M7.25,3 L4,3 Q3,3 3,4 L3,20 Q3,21 4,21 L18.5,21 Q19.5,21 19.5,20 L19.5,4 Q19.5,3 18.5,3 L15.25,3" />
      <rect x="7.25" y="1" width="8" height="4" rx="1" />
    </svg>
  );
}
