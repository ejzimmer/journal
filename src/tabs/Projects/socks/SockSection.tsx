import { SockSectionName } from './sockProgress';
import { SOCK_SECTION_SHAPES } from './sockShape';

type SockSectionProps = {
  section: SockSectionName;
  isKnitted: boolean;
  canChange: boolean;
  stitchesFill: string;
  onChangeKnittedCount: (change: 1 | -1) => void;
};

export function SockSection({
  section,
  isKnitted,
  canChange,
  stitchesFill,
  onChangeKnittedCount,
}: SockSectionProps) {
  const shape = SOCK_SECTION_SHAPES[section];
  const className = [
    'sock-section',
    isKnitted && 'knitted',
    canChange && 'changeable',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <g className={className}>
      <path
        d={shape}
        onClick={
          canChange ? () => onChangeKnittedCount(isKnitted ? -1 : 1) : undefined
        }
      >
        {canChange && (
          <title>{isKnitted ? `Unravel ${section}` : `Knit ${section}`}</title>
        )}
      </path>
      {isKnitted && (
        <path
          className="sock-stitches"
          d={shape}
          style={{ fill: stitchesFill }}
        />
      )}
    </g>
  );
}
