import { IconProps } from './types';

export function LightningBoltIcon({ colour = '#2f80ed', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" width="100%" fill={colour} {...props}>
      <path d="M11 1 4.5 11.5 9 11.5 8 19 15.5 8 10.5 8Z" />
    </svg>
  );
}
