import { FormEvent, useEffect, useId, useRef, useState } from 'react';
import { FormControl } from '../../../shared/controls/FormControl';
import { XIcon } from '../../../shared/icons/X';
import { SymptomPicker } from './SymptomPicker';

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
      <form onSubmit={handleSubmit}>
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
        <SymptomPicker trackers={trackers} onChange={setTrackers} />
        <button type="submit" />
      </form>
    </div>
  );
}

function parseCalories(input: HTMLInputElement) {
  return input.value ? Number.parseInt(input.value) : undefined;
}
