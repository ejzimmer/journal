import { KeyboardEvent, RefObject, useId, useState } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { ArrowDownIcon } from '../../../shared/icons/ArrowDown';
import { ArrowUpIcon } from '../../../shared/icons/ArrowUp';
import {
  SOCKS,
  Sock,
  SockDirection,
  SockProgress,
} from '../../../shared/types';
import {
  SECTIONS_PER_SOCK,
  clampKnittedCount,
  getKnitOrder,
  getKnittedCountAfterClick,
  getSocksKey,
} from './sockProgress';
import {
  SOCK_OUTLINE,
  SOCK_PAIR_VIEWBOX,
  SOCK_RIBS,
  SOCK_SECTION_LINES,
  SOCK_SECTION_SHAPES,
  getSockTransform,
} from './sockShape';

import './SockTracker.css';

type SockTrackerProps = {
  projectId: string;
  socks: SockProgress;
  trackerRef: RefObject<HTMLDivElement | null>;
};

export function SockTracker({
  projectId,
  socks,
  trackerRef,
}: SockTrackerProps) {
  const { setValue } = useStorageContext();

  const saveSocks = (nextSocks: SockProgress) =>
    setValue<SockProgress>(getSocksKey(projectId), nextSocks);

  const setKnittedCount = (sock: Sock, count: number) =>
    saveSocks({
      ...socks,
      knittedSections: {
        ...socks.knittedSections,
        [sock]: clampKnittedCount(count),
      },
    });

  return (
    <div className="sock-tracker" ref={trackerRef}>
      <svg className="sock-pair" viewBox={SOCK_PAIR_VIEWBOX}>
        {SOCKS.map((sock) => (
          <SockPicture
            key={sock}
            sock={sock}
            direction={socks.direction}
            knittedCount={socks.knittedSections[sock]}
            onChangeKnittedCount={(count) => setKnittedCount(sock, count)}
          />
        ))}
      </svg>
      <DirectionSwitch
        value={socks.direction}
        onChange={(direction) => saveSocks({ ...socks, direction })}
      />
    </div>
  );
}

type SockPictureProps = {
  sock: Sock;
  direction: SockDirection;
  knittedCount: number;
  onChangeKnittedCount: (count: number) => void;
};

function SockPicture({
  sock,
  direction,
  knittedCount,
  onChangeKnittedCount,
}: SockPictureProps) {
  const id = useId();
  const clipId = `${id}-clip`;
  const stitchesId = `${id}-stitches`;
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const knitOrder = getKnitOrder(direction);
  const isCuffKnitted = knitOrder.indexOf('cuff') < knittedCount;

  const getSectionState = (index: number) => {
    if (previewCount !== null && previewCount !== knittedCount) {
      const isInPreview =
        index >= Math.min(previewCount, knittedCount) &&
        index < Math.max(previewCount, knittedCount);
      if (isInPreview) {
        return previewCount > knittedCount ? 'to-knit' : 'knitted to-unravel';
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
      onMouseLeave={() => setPreviewCount(null)}
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
          const state = getSectionState(index);

          return (
            <g key={section} className={`sock-section ${state}`}>
              <path
                d={SOCK_SECTION_SHAPES[section]}
                onClick={() => onChangeKnittedCount(nextCount)}
                onMouseEnter={() => setPreviewCount(nextCount)}
              >
                <title>
                  {index < knittedCount
                    ? `Unravel from ${section}`
                    : `Knit through ${section}`}
                </title>
              </path>
              {state.includes('knitted') && (
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

const DIRECTIONS = [
  { direction: 'cuff_down', label: 'Cuff down', Icon: ArrowDownIcon },
  { direction: 'toe_up', label: 'Toe up', Icon: ArrowUpIcon },
] as const;

type DirectionSwitchProps = {
  value: SockDirection;
  onChange: (direction: SockDirection) => void;
};

function DirectionSwitch({ value, onChange }: DirectionSwitchProps) {
  const name = useId();

  return (
    <fieldset className="sock-direction" aria-label="Knitting direction">
      {DIRECTIONS.map(({ direction, label, Icon }) => (
        <label key={direction} title={label}>
          <input
            type="radio"
            name={name}
            value={direction}
            aria-label={label}
            checked={value === direction}
            onChange={() => onChange(direction)}
          />
          <Icon width="12px" />
        </label>
      ))}
    </fieldset>
  );
}
