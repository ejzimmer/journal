import './SubtaskList.css';
import { Checkbox } from 'shared/controls/Checkbox';
import { Subtask } from '../projects/types';
import { sortByPosition } from '../projects/sortByPosition';
import { AddSubtaskForm } from './AddSubtaskForm';
import { useSubtaskActions } from './useSubtaskActions';

type SubtaskListProps = {
  projectId: string;
  subtasks: Subtask[];
};

export function SubtaskList({ projectId, subtasks }: SubtaskListProps) {
  const { markSubtaskDone, addSubtask } = useSubtaskActions(
    projectId,
    subtasks,
  );
  const orderedSubtasks = sortByPosition(subtasks);

  return (
    <div className="subtask-list">
      {orderedSubtasks.length > 0 && (
        <ul aria-label="Steps">
          {orderedSubtasks.map((subtask) => (
            <li
              key={subtask.id}
              className={subtask.status === 'done' ? 'done' : undefined}
            >
              <Checkbox
                aria-label={subtask.description}
                isChecked={subtask.status === 'done'}
                onChange={(isDone) => markSubtaskDone(subtask, isDone)}
                useTickForDone
              />
              <span>{subtask.description}</span>
            </li>
          ))}
        </ul>
      )}
      <AddSubtaskForm onAdd={addSubtask} />
    </div>
  );
}
