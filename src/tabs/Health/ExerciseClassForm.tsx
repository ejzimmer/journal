import { FormEvent, useState } from 'react';
import { ExerciseClass } from '../../shared/types';
import { XIcon } from '../../shared/icons/X';
import { TickIcon } from '../../shared/icons/Tick';
import { ClassKind, ClassKindSwitch } from './ClassKindSwitch';
import { ClassKindRow } from './ClassKindRow';
import { ClassCountInput } from './ClassCountInput';
import { createClassBlocks } from './createClassBlocks';
import './ExerciseClassForm.css';

type ExerciseClassFormProps = {
  onSubmit: (exerciseClass: Omit<ExerciseClass, 'id'>) => void;
  onCancel: () => void;
};

export function ExerciseClassForm({
  onSubmit,
  onCancel,
}: ExerciseClassFormProps) {
  const [name, setName] = useState('');
  const [kind, setKind] = useState<ClassKind>('set');
  const [total, setTotal] = useState('10');
  const [weeks, setWeeks] = useState('4');
  const [perWeek, setPerWeek] = useState('3');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const blocks =
      kind === 'set'
        ? createClassBlocks(1, Number(total))
        : createClassBlocks(Number(weeks), Number(perWeek));
    if (!name.trim() || !blocks) {
      return;
    }
    onSubmit({ description: name.trim(), blocks });
  };

  const rowProps = (rowKind: ClassKind) => ({
    kind: rowKind,
    isSelected: kind === rowKind,
    onSelect: setKind,
  });

  return (
    <form
      className="exercise-class-form"
      aria-label="Add class"
      onSubmit={handleSubmit}
      onKeyDown={(event) => event.key === 'Escape' && onCancel()}
    >
      <label className="name-field">
        <span>Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
          required
        />
      </label>
      <div className="class-kinds">
        <ClassKindSwitch value={kind} onChange={setKind} />
        <ClassKindRow {...rowProps('set')}>
          <ClassCountInput
            label="Classes"
            value={total}
            onChange={setTotal}
            disabled={kind !== 'set'}
          />
          <span>classes</span>
        </ClassKindRow>
        <ClassKindRow {...rowProps('weekly')}>
          <ClassCountInput
            label="Weeks"
            value={weeks}
            onChange={setWeeks}
            disabled={kind !== 'weekly'}
          />
          <span>weeks ×</span>
          <ClassCountInput
            label="Classes a week"
            value={perWeek}
            onChange={setPerWeek}
            disabled={kind !== 'weekly'}
          />
          <span>a week</span>
        </ClassKindRow>
      </div>
      <div className="actions">
        <button type="button" className="cancel" onClick={onCancel}>
          <XIcon role="img" aria-label="Cancel" />
        </button>
        <button type="submit" className="save">
          <TickIcon role="img" aria-label="Save" />
        </button>
      </div>
    </form>
  );
}
