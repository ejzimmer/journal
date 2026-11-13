import { IconProps } from './types';

const DOT_POSITIONS = [4, 9, 14];

export function DotGridIcon({ colour = 'currentColor', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" fill={colour} width="100%" {...props}>
      {DOT_POSITIONS.flatMap((cy) =>
        DOT_POSITIONS.map((cx) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2" />
        )),
      )}
    </svg>
  );
}
