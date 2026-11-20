import { SymptomIcons } from './SymptomIcons';
import { LoggedSymptom } from './symptoms';
import { LoggedSymptomIcon } from './LoggedSymptomIcon';
import { WATCH } from './watchCharging';
import { HOVER_ICON_SIZE } from './hoverSize';
import './DayHoverCircle.css';

type DayHoverCircleProps = {
  day: number;
  month: string;
  balance?: number;
  symptoms: LoggedSymptom[];
  watchCharged: boolean;
  onSelect: () => void;
};

export function DayHoverCircle({
  day,
  month,
  balance,
  symptoms,
  watchCharged,
  onSelect,
}: DayHoverCircleProps) {
  return (
    <div className="day-hover-circle" aria-hidden="true" onClick={onSelect}>
      <div className="day-hover-heading">
        <b>
          {day} {month}
        </b>
        <div>{balance?.toLocaleString()}</div>
        {watchCharged && (
          <LoggedSymptomIcon
            icon={{ symptom: WATCH, magnitude: 1 }}
            iconSize={HOVER_ICON_SIZE}
            hasTooltip
          />
        )}
      </div>
      <SymptomIcons
        symptoms={symptoms}
        iconSize={HOVER_ICON_SIZE}
        hasTooltips
      />
    </div>
  );
}
