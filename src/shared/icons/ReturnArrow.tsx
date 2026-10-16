import { IconProps } from './types';

export function ReturnArrowIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="100%"
      fill="none"
      {...props}
    >
      <path d="M17,3 L17,9 Q17,13 13,13 L3,13" />
      <path d="M8,8 L3,13 8,18" />
    </svg>
  );
}
