import {
  Fragment,
  FormEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
  useRef,
} from 'react';
import { sortByPosition } from '../../../shared/drag-and-drop/utils';
import { useWorkStorage } from '../WorkStorageContext';
import { Subtask } from '../types';
import { BracketsIcon } from '../../../shared/icons/Brackets';
import { StandardChecklistButton } from './StandardChecklistButton';
import { useFormToggle } from '../../../shared/controls/useFormToggle';

type SubtasksProps = {
  subtasks?: Record<string, Subtask>;
  listId: string;
  taskId: string;
};

export function Subtasks({ subtasks, listId, taskId }: SubtasksProps) {
  const { deleteSubtask, updateSubtasksList } = useWorkStorage();
  const {
    isFormOpen: isEditing,
    triggerRef,
    openForm: startEditing,
    closeForm,
  } = useFormToggle();
  const inputRef = useRef<HTMLInputElement>(null);

  const sorted = sortByPosition(Object.values(subtasks ?? {}));
  const hasSubtasks = sorted.length > 0;

  const save = () => {
    const text = inputRef.current?.value ?? '';
    const descriptions = text
      .split(',')
      .map((description) => description.trim())
      .filter(Boolean);

    const remaining = [...sorted];
    const newSubtasks = descriptions.map((description, index) => {
      const existingIndex = remaining.findIndex(
        (subtask) => subtask.description === description,
      );
      const [existing] =
        existingIndex === -1 ? [] : remaining.splice(existingIndex, 1);
      return {
        id: existing?.id ?? crypto.randomUUID(),
        description,
        position: index,
      };
    });
    updateSubtasksList(listId, taskId, newSubtasks);
  };

  const stopEditing = (shouldSave: boolean) => {
    if (shouldSave) save();
    closeForm();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    stopEditing(true);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      stopEditing(false);
    }
  };

  if (isEditing) {
    return (
      <form className="subtasks editing" onSubmit={handleSubmit}>
        <span className="bracket">[</span>
        <input
          ref={inputRef}
          autoFocus
          aria-label="Edit subtasks"
          className="inline"
          defaultValue={sorted.map((subtask) => subtask.description).join(', ')}
          onKeyDown={handleKeyDown}
        />
        <span className="bracket">]</span>
      </form>
    );
  }

  return (
    <>
      {hasSubtasks ? (
        <span className="subtasks">
          <EditSubtasksButton ref={triggerRef} onClick={startEditing}>
            [
          </EditSubtasksButton>
          {sorted.map((subtask, index) => (
            <Fragment key={subtask.id}>
              {index > 0 && (
                <EditSubtasksButton onClick={startEditing}>
                  ,&nbsp;
                </EditSubtasksButton>
              )}
              <button
                type="button"
                className="subtask"
                onClick={() => deleteSubtask(listId, taskId, subtask)}
              >
                {subtask.description}
              </button>
            </Fragment>
          ))}
          <EditSubtasksButton onClick={startEditing}>]</EditSubtasksButton>
        </span>
      ) : (
        <button
          ref={triggerRef}
          type="button"
          className="add-metadata ghost"
          aria-label="Add subtask"
          onClick={startEditing}
        >
          <BracketsIcon width="16px" />
        </button>
      )}
      <StandardChecklistButton listId={listId} taskId={taskId} />
    </>
  );
}

function EditSubtasksButton({
  ref,
  onClick,
  children,
}: {
  ref?: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      ref={ref}
      type="button"
      className="edit-subtasks"
      aria-label="Edit subtasks"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
