import { useStorageContext } from 'shared/FirebaseContext';
import { SubtaskSlot } from 'shared/todaySlots/types';
import {
  AmimonoProject,
  AmimonoSubtask,
  ProjectDetails,
  PROJECTS_KEY,
  ProjectSubtask,
} from '../../types';
import { DailyGoal } from './DailyGoal';
import {
  getProjectPath,
  isAmimonoSubtaskPath,
  toggleSubtaskInProject,
} from './slots';

type SubtaskSlotItemProps = { slot: SubtaskSlot };

export function SubtaskSlotItem({ slot }: SubtaskSlotItemProps) {
  const { useValue, updateItem, setValue } = useStorageContext();
  const { value: task } = useValue<ProjectSubtask | AmimonoSubtask>(
    slot.subtaskPath,
  );
  const { value: project } = useValue<ProjectDetails | AmimonoProject>(
    getProjectPath(slot.subtaskPath),
  );
  if (!task || !project) {
    return null;
  }

  const toggleTask = () => {
    if (isAmimonoSubtaskPath(slot.subtaskPath)) {
      setValue(
        `${slot.subtaskPath}/status`,
        task.status === 'done' ? 'ready' : 'done',
      );
    } else {
      updateItem<ProjectDetails>(
        PROJECTS_KEY,
        toggleSubtaskInProject(
          project as ProjectDetails,
          task as ProjectSubtask,
        ),
      );
    }
  };

  return <DailyGoal task={task} project={project} onToggle={toggleTask} />;
}
