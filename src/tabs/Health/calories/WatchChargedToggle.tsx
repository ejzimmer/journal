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
    <button
      type="button"
      className="watch-charged-toggle"
      aria-label={WATCH.label}
      aria-pressed={charged}
      onClick={() => onChange(!charged)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          event.currentTarget.form?.requestSubmit();
        }
      }}
    >
      <SymptomIcon symptom={WATCH} magnitude={1} width="24px" />
    </button>
  );
}
