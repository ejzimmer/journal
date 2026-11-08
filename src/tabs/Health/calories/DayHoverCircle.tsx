import { CSSProperties } from 'react';
import { SymptomIcons } from './SymptomIcons';
import { LoggedSymptom } from './symptoms';
import { SymptomIcon } from './SymptomIcon';
import { WATCH } from './watchCharging';
import { splitIntoRows } from './symptomRows';
import './DayHoverCircle.css';

const ICON_SIZE = 24;
const GAP = 2;
const TEXT_WIDTH = 70;
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
          '--hover-size': getHoverSize(symptoms),
        } as CSSProperties
      }
    >
      <div className="day-hover-heading">
        <b>
          {day} {month}
        </b>
        <div>{balance?.toLocaleString()}</div>
        {watchCharged && (
          <SymptomIcon
            symptom={WATCH}
            magnitude={1}
            width={`${ICON_SIZE}px`}
            onDot
          />
        )}
      </div>
      <SymptomIcons symptoms={symptoms} iconSize={ICON_SIZE} />
    </div>
  );
}

function getHoverSize(symptoms: LoggedSymptom[]) {
  const rows = splitIntoRows(symptoms);
  if (!rows.length) return MIN_SIZE;

  const longestRow = Math.max(...rows.map((row) => row.length));
  const iconsWidth = longestRow * ICON_SIZE + (longestRow - 1) * GAP;
  const iconsHeight = rows.length * ICON_SIZE + (rows.length - 1) * GAP;
  const width = Math.max(TEXT_WIDTH, iconsWidth);
  const height = TEXT_HEIGHT + GAP * 2 + iconsHeight;

  return Math.max(MIN_SIZE, Math.ceil(Math.hypot(width, height)) + PADDING);
}
