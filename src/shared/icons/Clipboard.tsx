import { IconProps } from './types';

export function ClipboardIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 22"
      stroke={colour}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      fill="none"
      {...props}
    >
      <path d="M6,3 L4,3 Q3,3 3,4 L3,20 Q3,21 4,21 L16,21 Q17,21 17,20 L17,4 Q17,3 16,3 L14,3" />
      <rect x="6" y="1" width="8" height="4" rx="1" />
    </svg>
  );
}
