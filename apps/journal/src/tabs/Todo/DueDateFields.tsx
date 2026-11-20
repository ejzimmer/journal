import { useId } from 'react';
import { FormControl } from 'shared/controls/FormControl';
import { TickIcon } from 'shared/icons/Tick';

type DueDateFieldsProps = {
  dueDate: string;
  repeats: boolean;
  onChangeDueDate: (dueDate: string) => void;
  onChangeRepeats: (repeats: boolean) => void;
};

export function DueDateFields({
  dueDate,
  repeats,
  onChangeDueDate,
  onChangeRepeats,
}: DueDateFieldsProps) {
  const repeatsId = useId();

  return (
    <>
      <FormControl
        label="Due date"
        type="date"
        value={dueDate}
        onChange={onChangeDueDate}
      />
      <div className="form-control repeats">
        <label htmlFor={repeatsId}>Repeats</label>
        <div className="box">
          <input
            id={repeatsId}
            type="checkbox"
            className="led-push-button"
            checked={repeats}
            onChange={(event) => onChangeRepeats(event.target.checked)}
          />
          <TickIcon width="20px" />
        </div>
      </div>
    </>
  );
}
