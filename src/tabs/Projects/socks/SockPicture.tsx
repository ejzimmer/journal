import { KeyboardEvent, useId } from 'react';
import { Sock, SockDirection } from '../../../shared/types';
import {
  SECTIONS_PER_SOCK,
  clampKnittedCount,
  getKnitOrder,
} from './sockProgress';
import { SockSection } from './SockSection';
import {
  SOCK_OUTLINE,
  SOCK_RIBS,
  SOCK_SECTION_LINES,
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
  const knitOrder = getKnitOrder(direction);
  const isCuffKnitted = knitOrder.indexOf('cuff') < knittedCount;

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
        {knitOrder.map((section, index) => (
          <SockSection
            key={section}
            section={section}
            isKnitted={index < knittedCount}
            canChange={index === knittedCount || index === knittedCount - 1}
            stitchesFill={`url(#${stitchesId})`}
            onChangeKnittedCount={(change) =>
              onChangeKnittedCount(knittedCount + change)
            }
          />
        ))}
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
