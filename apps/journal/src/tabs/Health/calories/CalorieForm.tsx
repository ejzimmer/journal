import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { FormControl } from 'shared/controls/FormControl';
import { XIcon } from 'shared/icons/X';
import { SymptomPicker } from './SymptomPicker';
import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { Tooltip } from 'shared/controls/Tooltip';
import { SymptomIcon } from './SymptomIcon';
import { isWatchCharged, setWatchCharged, WATCH } from './watchCharging';

type CalorieFormProps = {
  date: { day: number; month: string };
  consumed?: number;
  expended?: number;
  trackers?: string[];
  onClose: () => void;
  onSubmit: ({
    consumed,
    expended,
    trackers,
  }: {
    consumed?: number;
    expended?: number;
    trackers: string[];
  }) => void;
};

export function CalorieForm({
  date,
  consumed,
  expended,
  trackers: initialTrackers,
  onClose,
  onSubmit,
}: CalorieFormProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const dateHeadingId = useId();
  const [trackers, setTrackers] = useState<string[]>(initialTrackers ?? []);

  useEffect(() => {
    popoverRef.current?.showPopover();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const [consumedElement, expendedElement] = (event.target as HTMLFormElement)
      .elements;

    onSubmit({
      consumed: parseCalories(consumedElement as HTMLInputElement),
      expended: parseCalories(expendedElement as HTMLInputElement),
      trackers,
    });
    onClose();
  };

  const submitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    event.currentTarget.requestSubmit();
  };

  return (
    <div
      ref={popoverRef}
      popover="auto"
      className="calorie-form-card"
      role="dialog"
      aria-labelledby={dateHeadingId}
      onToggle={(event) => {
        if (
          event.target === event.currentTarget &&
          event.newState === 'closed'
        ) {
          onClose();
        }
      }}
    >
      <button
        className="icon ghost dismiss"
        aria-label="dismiss"
        onClick={onClose}
      >
        <XIcon width="16px" />
      </button>
      <h2 id={dateHeadingId}>
        {date.day} {date.month}
      </h2>
      <form onSubmit={handleSubmit} onKeyDown={submitOnEnter}>
        <FormControl
          hideLabel
          pattern="[0-9]{1,4}"
          label="In"
          defaultValue={`${consumed ?? ''}`}
          size={4}
        />
        <FormControl
          hideLabel
          pattern="[0-9]{1,4}"
          label="Out"
          defaultValue={`${expended ?? ''}`}
          size={4}
        />
        <div className="day-trackers">
          <Tooltip label={WATCH.label}>
            {(triggerProps) => (
              <EmojiCheckbox
                emoji={
                  <SymptomIcon symptom={WATCH} magnitude={1} width="24px" />
                }
                label={WATCH.label}
                isChecked={isWatchCharged(trackers)}
                onChange={(event) =>
                  setTrackers(setWatchCharged(trackers, event.target.checked))
                }
                tooltipTriggerProps={triggerProps}
              />
            )}
          </Tooltip>
          <SymptomPicker trackers={trackers} onChange={setTrackers} />
        </div>
        <button type="submit" />
      </form>
    </div>
  );
}

function parseCalories(input: HTMLInputElement) {
  return input.value ? Number.parseInt(input.value) : undefined;
}
