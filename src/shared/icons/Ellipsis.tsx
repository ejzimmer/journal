import { IconProps } from './types';

export function EllipsisIcon({ colour = 'currentColor', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 30 10" stroke={colour} width="100%" {...props}>
      <circle cx="5" cy="5" r="2.5" />
      <circle cx="15" cy="5" r="2.5" />
      <circle cx="25" cy="5" r="2.5" />
    </svg>
  );
}
