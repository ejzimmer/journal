import { SymptomIcons } from './SymptomIcons';
import { LoggedSymptom } from './symptoms';
import { SymptomIcon } from './SymptomIcon';
import { WATCH } from './watchCharging';
import { HOVER_ICON_SIZE } from './hoverSize';
import './DayHoverCircle.css';

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
    <div className="day-hover-circle" aria-hidden="true">
      <div className="day-hover-heading">
        <b>
          {day} {month}
        </b>
        <div>{balance?.toLocaleString()}</div>
        {watchCharged && (
          <SymptomIcon
            symptom={WATCH}
            magnitude={1}
            width={`${HOVER_ICON_SIZE}px`}
            onDot
          />
        )}
      </div>
      <SymptomIcons symptoms={symptoms} iconSize={HOVER_ICON_SIZE} />
    </div>
  );
}
