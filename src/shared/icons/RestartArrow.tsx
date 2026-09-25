import { IconProps } from './types';

export function RestartArrowIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 20"
      stroke={colour}
      strokeWidth="2"
      width="100%"
      fill="none"
      strokeLinecap="round"
      transform="rotate(-10, 0, 0)"
      {...props}
    >
      <path
        d="M 4 10
           A 6 6 270 1 0 8 5"
      />
      <path d="M8,5 L11.5,2" />
      <path d="M8,5 L11,8" />
    </svg>
  );
}
