import { Tooltip, TooltipTriggerProps } from 'shared/controls/Tooltip';
import { SymptomIcon } from './SymptomIcon';
import { LoggedSymptom } from './symptoms';

type LoggedSymptomIconProps = {
  icon: LoggedSymptom;
  iconSize: number;
  hasTooltip?: boolean;
};

export function LoggedSymptomIcon({
  icon: { symptom, magnitude },
  iconSize,
  hasTooltip,
}: LoggedSymptomIconProps) {
  const renderIcon = (triggerProps?: TooltipTriggerProps) => (
    <span
      {...triggerProps}
      role="img"
      aria-label={
        symptom.unlevelled ? symptom.label : `${symptom.label} ${magnitude}`
      }
    >
      <SymptomIcon
        symptom={symptom}
        magnitude={magnitude}
        width={`${iconSize}px`}
        onDot
      />
    </span>
  );

  return hasTooltip ? (
    <Tooltip label={symptom.label} position="top-right">
      {renderIcon}
    </Tooltip>
  ) : (
    renderIcon()
  );
}
