import { CSSProperties } from 'react';
import { SymptomIcons } from './SymptomIcons';
import { LoggedSymptom } from './symptoms';
import { WatchIcon } from './WatchIcon';
import { WATCH } from './watchCharging';
import { splitIntoRows } from './symptomRows';
import './DayHoverCircle.css';

const ICON_SIZE = 18;
const GAP = 2;
const TEXT_WIDTH = 70;
const WATCH_SIZE = 16;
const TEXT_HEIGHT = 36;
const MIN_SIZE = 106;
const PADDING = 14;

type DayHoverCircleProps = {
  day: number;
  month: string;
  balance?: number;
  symptoms: LoggedSymptom[];
  watchCharged: boolean;
};

export function DayHoverCircle({
  day,
  month,
  balance,
  symptoms,
  watchCharged,
}: DayHoverCircleProps) {
  return (
    <div
      className="day-hover-circle"
      aria-hidden="true"
      style={
        {
          '--hover-size': getHoverSize(symptoms, watchCharged),
        } as CSSProperties
      }
    >
      <b>
        {day} {month}
        {watchCharged && (
          <WatchIcon colour={WATCH.colour} width={`${WATCH_SIZE}px`} />
        )}
      </b>
      <div>{balance?.toLocaleString()}</div>
      <SymptomIcons symptoms={symptoms} iconSize={ICON_SIZE} />
    </div>
  );
}

function getHoverSize(symptoms: LoggedSymptom[], watchCharged: boolean) {
  const textWidth = watchCharged ? TEXT_WIDTH + WATCH_SIZE + GAP : TEXT_WIDTH;
  const rows = splitIntoRows(symptoms);
  if (!rows.length) {
    return Math.max(
      MIN_SIZE,
      Math.ceil(Math.hypot(textWidth, TEXT_HEIGHT)) + PADDING,
    );
  }

  const longestRow = Math.max(...rows.map((row) => row.length));
  const iconsWidth = longestRow * ICON_SIZE + (longestRow - 1) * GAP;
  const iconsHeight = rows.length * ICON_SIZE + (rows.length - 1) * GAP;
  const width = Math.max(textWidth, iconsWidth);
  const height = TEXT_HEIGHT + GAP * 2 + iconsHeight;

  return Math.max(MIN_SIZE, Math.ceil(Math.hypot(width, height)) + PADDING);
}
