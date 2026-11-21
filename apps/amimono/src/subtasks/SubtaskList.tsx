import './SubtaskList.css';
import { Checkbox } from 'shared/controls/Checkbox';
import { TodayLinkCheckbox } from 'shared/todaySlots/TodayLinkCheckbox';
import { AMIMONO_PROJECTS_PATH } from 'shared/todaySlots/types';
import { Subtask } from '../projects/types';
import { sortByPosition } from 'shared/drag-and-drop/utils';
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
        <ul aria-label="Subtasks">
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
              <span className="subtask-description">{subtask.description}</span>
              <TodayLinkCheckbox
                subtaskPath={`${AMIMONO_PROJECTS_PATH}/${projectId}/subtasks/${subtask.id}`}
              />
            </li>
          ))}
        </ul>
      )}
      <AddSubtaskForm onAdd={addSubtask} />
    </div>
  );
}
