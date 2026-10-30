import { FocusEvent, FormEvent, useRef } from 'react';
import { TickIcon } from '../../../shared/icons/Tick';

type BlockedUntilFormProps = {
  until?: string;
  onSubmit: (until: string) => void;
  onCancel: () => void;
};

export function BlockedUntilForm({
  until,
  onSubmit,
  onCancel,
}: BlockedUntilFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const value = inputRef.current?.value;
    if (value) {
      onSubmit(value);
    }
  };

  const cancelOnFocusLeaving = (event: FocusEvent<HTMLFormElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      onCancel();
    }
  };

  return (
    <form
      className="blocked-until-form"
      onSubmit={submit}
      onBlur={cancelOnFocusLeaving}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onCancel();
        }
      }}
    >
      <input
        ref={inputRef}
        type="datetime-local"
        aria-label="Blocked until"
        defaultValue={until ?? getNextWholeHour()}
        autoFocus
      />
      <button type="submit" className="ghost" aria-label="Save blocked until">
        <TickIcon width="16px" />
      </button>
    </form>
  );
}

const getNextWholeHour = () =>
  Temporal.Now.plainDateTimeISO()
    .round({ smallestUnit: 'hour', roundingMode: 'ceil' })
    .toString({ smallestUnit: 'minute' });
