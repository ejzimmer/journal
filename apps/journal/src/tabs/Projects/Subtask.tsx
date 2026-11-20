import { ReactElement } from 'react';
import { Checkbox } from 'shared/controls/Checkbox';
import { useStorageContext } from 'shared/FirebaseContext';
import { ProjectSubtask } from '../../types';
import { useLinkedTasks } from './utils';
import { EditableText } from 'shared/controls/EditableText';
import { DraggableListItem } from 'shared/drag-and-drop/DraggableListItem';
import { DragPreview } from 'shared/drag-and-drop/DragPreview';
import { draggableTypeKey } from 'shared/drag-and-drop/types';
import { getToday } from 'shared/dates';
import { TodayLinkCheckbox } from './TodayLinkCheckbox';

type SubtaskProps = ProjectSubtask & {
  path: string;
  dragHandle: ReactElement;
};

export function Subtask({ path, dragHandle, ...task }: SubtaskProps) {
  const { updateItem, deleteItem } = useStorageContext();

  const { linkedTask, updateLinkedTask } = useLinkedTasks(task.linkedId);

  const updateTask = (task: ProjectSubtask) => {
    updateItem<ProjectSubtask>(path, task);
  };

  const handleChange = () => {
    const status = task.status === 'done' ? 'ready' : 'done';
    updateTask({ ...task, status });

    updateLinkedTask({
      status,
      lastCompleted: getToday(),
    });
  };

  return (
    <DraggableListItem
      getData={() => ({
        [draggableTypeKey]: `subtask-${path}`,
        id: task.id,
        parentId: path,
      })}
      dragPreview={<DragPreview>{task.description}</DragPreview>}
      isDroppable={(data) =>
        draggableTypeKey in data && data[draggableTypeKey] === `subtask-${path}`
      }
      allowedEdges={['top', 'bottom']}
      dragHandle={dragHandle}
      className="subtask"
    >
      <Checkbox
        isChecked={task.status === 'done'}
        onChange={handleChange}
        useTickForDone
        aria-label={`${task.description} ${task.status}`}
      />
      <EditableText
        label="project"
        value={task.description}
        onChange={(description) => {
          updateTask({ ...task, description });
        }}
        onDelete={() => deleteItem(path, task)}
        style={{ fontSize: '1em' }}
      />
      <TodayLinkCheckbox
        subtaskPath={`${path}/${task.id}`}
        hasLegacyLink={!!linkedTask}
      />
    </DraggableListItem>
  );
}
