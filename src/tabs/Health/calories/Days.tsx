import { CSSProperties, useMemo } from 'react';

import './Days.css';
import { Balance } from '../utils';
import { SymptomIcons } from './SymptomIcons';
import { DayHoverCircle } from './DayHoverCircle';
import { isWatchCharged, listDayIcons } from './watchCharging';
import { parseSymptoms } from './symptoms';
import { getRestingIconSize } from './restingIconSize';

const MAX_RESTING_ICONS = 7;

type DaysProps = {
  days: Balance[];
  onSelectDay: (dayId: string) => void;
};

export function Days({ days, onSelectDay }: DaysProps) {
  const maxDiff = useMemo(
    () =>
      days.reduce(
        (max, { diff }) =>
          typeof diff === 'number' ? Math.max(max, Math.abs(diff)) : max,
        0,
      ),
    [days],
  );
  const popDelays = useMemo(() => days.map(() => Math.random() * 0.3), [days]);
  const startingIndex = days[0]?.dayOfWeek ?? 1;

  return (
    <ol
      className="day-grid"
      aria-label="by day"
      style={{ '--starting-index': startingIndex } as CSSProperties}
    >
      {days.map((day, index) => {
        const restingIcons = listDayIcons(day.trackers);
        return (
          <li
            key={day.id}
            className="day-circle"
            style={
              {
                animationDelay: `${popDelays[index]}s`,
                ...(typeof day.diff === 'number'
                  ? { '--day-colour': getDayColour(day.diff, maxDiff) }
                  : {}),
              } as CSSProperties
            }
          >
            <button
              type="button"
              className="day-button"
              aria-label={`update ${day.day} ${day.month}`}
              onClick={() => onSelectDay(day.id)}
            >
              <SymptomIcons
                symptoms={restingIcons}
                iconSize={getRestingIconSize(
                  Math.min(restingIcons.length, MAX_RESTING_ICONS),
                )}
                maxIcons={MAX_RESTING_ICONS}
              />
            </button>
            <DayHoverCircle
              day={day.day}
              month={day.month}
              balance={day.balance}
              symptoms={parseSymptoms(day.trackers)}
              watchCharged={isWatchCharged(day.trackers)}
            />
          </li>
        );
      })}
    </ol>
  );
}

const DARKEST_DEFICIT = 370;

function getDayColour(diff: number, maxDiff: number) {
  const scale = diff > 0 ? DARKEST_DEFICIT : maxDiff;
  const intensity = scale === 0 ? 1 : Math.min(Math.abs(diff) / scale, 1);
  const hue = diff < 0 ? 77 : 104;

  const lightness = intensity * 78 + (1 - intensity) * 100;
  const chroma = intensity * 230;

  return `lch(${lightness}% ${chroma} ${hue})`;
}
