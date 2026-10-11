import { KeyboardEvent, useId, useState } from 'react';
import { Sock, SockDirection } from '../../../shared/types';
import {
  SECTIONS_PER_SOCK,
  clampKnittedCount,
  getKnitOrder,
  getKnittedCountAfterClick,
} from './sockProgress';
import {
  SOCK_OUTLINE,
  SOCK_RIBS,
  SOCK_SECTION_LINES,
  SOCK_SECTION_SHAPES,
  getSockTransform,
} from './sockShape';

type SockPictureProps = {
  sock: Sock;
  direction: SockDirection;
  knittedCount: number;
  onChangeKnittedCount: (count: number) => void;
};

export function SockPicture({
  sock,
  direction,
  knittedCount,
  onChangeKnittedCount,
}: SockPictureProps) {
  const id = useId();
  const clipId = `${id}-clip`;
  const stitchesId = `${id}-stitches`;
  const [hoveredKnittedCount, setHoveredKnittedCount] = useState<number | null>(
    null,
  );

  const knitOrder = getKnitOrder(direction);
  const isCuffKnitted = knitOrder.indexOf('cuff') < knittedCount;

  const getSectionClassName = (index: number) => {
    if (hoveredKnittedCount !== null && hoveredKnittedCount !== knittedCount) {
      const isHoverPreview =
        index >= Math.min(hoveredKnittedCount, knittedCount) &&
        index < Math.max(hoveredKnittedCount, knittedCount);
      if (isHoverPreview) {
        return hoveredKnittedCount > knittedCount
          ? 'to-knit'
          : 'knitted to-unravel';
      }
    }
    if (index < knittedCount) return 'knitted';
    if (index === knittedCount) return 'next';
    return '';
  };

  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    const [knitKey, unravelKey] =
      direction === 'cuff_down'
        ? ['ArrowDown', 'ArrowUp']
        : ['ArrowUp', 'ArrowDown'];
    const keyCounts: Record<string, number> = {
      [knitKey]: knittedCount + 1,
      ArrowRight: knittedCount + 1,
      [unravelKey]: knittedCount - 1,
      ArrowLeft: knittedCount - 1,
      Home: 0,
      End: SECTIONS_PER_SOCK,
    };
    if (!(event.key in keyCounts)) return;

    event.preventDefault();
    onChangeKnittedCount(clampKnittedCount(keyCounts[event.key]));
  };

  return (
    <g
      className="sock"
      role="slider"
      tabIndex={0}
      aria-label={`${sock} sock`}
      aria-valuemin={0}
      aria-valuemax={SECTIONS_PER_SOCK}
      aria-valuenow={knittedCount}
      aria-valuetext={`${knittedCount} of ${SECTIONS_PER_SOCK} sections knitted`}
      transform={getSockTransform(sock)}
      onKeyDown={onKeyDown}
      onMouseLeave={() => setHoveredKnittedCount(null)}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={SOCK_OUTLINE} />
        </clipPath>
        <pattern
          id={stitchesId}
          width="12.5"
          height="11.25"
          patternUnits="userSpaceOnUse"
        >
          <path className="sock-stitch" d="M1 1 L6.25 9.5 L11.5 1" />
        </pattern>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect className="sock-background" width="500" height="500" />
        {knitOrder.map((section, index) => {
          const nextCount = getKnittedCountAfterClick(index, knittedCount);
          const className = getSectionClassName(index);

          return (
            <g key={section} className={`sock-section ${className}`}>
              <path
                d={SOCK_SECTION_SHAPES[section]}
                onClick={() => onChangeKnittedCount(nextCount)}
                onMouseEnter={() => setHoveredKnittedCount(nextCount)}
              >
                <title>
                  {index < knittedCount
                    ? `Unravel from ${section}`
                    : `Knit through ${section}`}
                </title>
              </path>
              {className.includes('knitted') && (
                <path
                  className="sock-stitches"
                  d={SOCK_SECTION_SHAPES[section]}
                  style={{ fill: `url(#${stitchesId})` }}
                />
              )}
            </g>
          );
        })}
        <path
          className={`sock-ribs ${isCuffKnitted ? 'knitted' : ''}`}
          d={SOCK_RIBS}
        />
        <path className="sock-section-lines" d={SOCK_SECTION_LINES} />
      </g>
      <path className="sock-outline" d={SOCK_OUTLINE} />
    </g>
  );
}
