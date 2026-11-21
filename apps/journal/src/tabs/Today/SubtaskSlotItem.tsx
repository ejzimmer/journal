import { useStorageContext } from 'shared/FirebaseContext';
import { SubtaskSlot } from 'shared/todaySlots/types';
import { ProjectDetails, PROJECTS_KEY, ProjectSubtask } from '../../types';
import { getProjectPath, toggleSubtaskInProject } from './slots';
import { SubtaskSlotContent } from './SubtaskSlotContent';

type SubtaskSlotItemProps = { slot: SubtaskSlot };

export function SubtaskSlotItem({ slot }: SubtaskSlotItemProps) {
  const { useValue, updateItem } = useStorageContext();
  const { value: subtask } = useValue<ProjectSubtask>(slot.subtaskPath);
  const { value: project } = useValue<ProjectDetails>(
    getProjectPath(slot.subtaskPath),
  );
  if (!subtask || !project) {
    return null;
  }

  return (
    <SubtaskSlotContent
      emoji={subtask.category}
      description={`${project.description}: ${subtask.description}`}
      isDone={subtask.status === 'done'}
      onToggle={() =>
        updateItem<ProjectDetails>(
          PROJECTS_KEY,
          toggleSubtaskInProject(project, subtask),
        )
      }
    />
  );
}
