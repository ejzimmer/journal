import { ReactElement, Ref } from 'react';
import { isTask } from '../drag-utils';

import { DraggableListItem } from '../../../shared/drag-and-drop/DraggableListItem';
import { DragPreview } from '../../../shared/drag-and-drop/DragPreview';
import { draggableTypeKey } from '../../../shared/drag-and-drop/types';
import { Checkbox } from '../../../shared/controls/Checkbox';
import { Blocker, WorkTask, WORK_KEY } from '../types';
import { useWorkStorage } from '../WorkStorageContext';
import { Labels } from './Labels';
import { UpdateLabels } from './UpdateLabels';
import { DueDate } from './DueDate';
import {
  EditableText,
  EditableTextHandle,
} from '../../../shared/controls/EditableText';
import { Subtasks } from './Subtasks';
import { BlockedMarker } from './BlockedMarker';
import { getToday } from '../../../shared/dates';

type TaskProps = {
  task: WorkTask;
  listId: string;
  dragHandle: ReactElement;
  descriptionRef?: Ref<EditableTextHandle>;
  onDeleted: () => void;
};

export function Task({
  task,
  listId,
  dragHandle,
  descriptionRef,
  onDeleted,
}: TaskProps) {
  const { updateTask, deleteTask, addLabel, removeLabel } = useWorkStorage();
  const hasLabels = (task.labelIds?.length ?? 0) > 0;

  const onChangeDueDate = (date?: string) => {
    const { dueDate, ...taskWithoutDueDate } = task;
    if (date) {
      updateTask(listId, { ...task, dueDate: date });
    } else {
      updateTask(listId, taskWithoutDueDate);
    }
  };

  const onChangeBlockedOn = (blocker?: Blocker) => {
    const { blockedOn, ...taskWithoutBlocked } = task;
    if (blocker) {
      updateTask(listId, { ...task, blockedOn: blocker });
    } else {
      updateTask(listId, taskWithoutBlocked);
    }
  };

  return (
    <DraggableListItem
      getData={() => ({
        [draggableTypeKey]: 'task',
        id: task.id,
        parentId: `${WORK_KEY}/${listId}/items`,
      })}
      dragPreview={<DragPreview>{task.description}</DragPreview>}
      isDroppable={isTask}
      allowedEdges={['top', 'bottom']}
      className={`task status-${task.status}`}
      dragHandle={dragHandle}
    >
      <BlockedMarker blockedOn={task.blockedOn} onChange={onChangeBlockedOn} />
      <div className="checkbox-container">
        <Checkbox
          isChecked={task.status === 'done'}
          onChange={(isChecked) => {
            const status = isChecked ? 'done' : 'not_started';
            updateTask(listId, {
              ...task,
              status,
              lastStatusUpdate: getToday(),
            });
          }}
          aria-label={`${task.description}`}
        />
      </div>
      <div className="task-content">
        <EditableText
          ref={descriptionRef}
          label={`Edit description ${task.description}`}
          value={task.description}
          onChange={(description) => {
            updateTask(listId, {
              ...task,
              description,
            });
          }}
          onDelete={() => {
            deleteTask(listId, task);
            onDeleted();
          }}
          className="inline"
          style={{ fontSize: 'inherit' }}
        />
        <Subtasks subtasks={task.subtasks} listId={listId} taskId={task.id} />
        {hasLabels && (
          <Labels
            labelIds={task.labelIds}
            onRemoveLabel={(id) => removeLabel(id, task)}
          />
        )}

        {!hasLabels && (
          <DueDate dueDate={task.dueDate} onChange={onChangeDueDate} />
        )}

        <UpdateLabels
          onChangeLabels={(labels) =>
            labels.forEach((label) => addLabel(label, task))
          }
        />

        {hasLabels && (
          <DueDate dueDate={task.dueDate} onChange={onChangeDueDate} />
        )}
      </div>
    </DraggableListItem>
  );
}
