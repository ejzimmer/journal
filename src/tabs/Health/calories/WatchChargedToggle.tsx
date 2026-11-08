import { Tooltip } from '../../../shared/controls/Tooltip';
import { SymptomIcon } from './SymptomIcon';
import { WATCH } from './watchCharging';
import './WatchChargedToggle.css';

type WatchChargedToggleProps = {
  charged: boolean;
  onChange: (charged: boolean) => void;
};

export function WatchChargedToggle({
  charged,
  onChange,
}: WatchChargedToggleProps) {
  return (
    <Tooltip label={WATCH.label}>
      {(triggerProps) => (
        <button
          {...triggerProps}
          type="button"
          className="watch-charged-toggle"
          aria-label={WATCH.label}
          aria-pressed={charged}
          onClick={() => onChange(!charged)}
        >
          <SymptomIcon symptom={WATCH} magnitude={1} width="24px" />
        </button>
      )}
    </Tooltip>
  );
}
