import { useStorageContext } from 'shared/FirebaseContext';
import { BaseProject, BaseSubtask } from 'shared/projects/types';
import { SubtaskSlot } from 'shared/todaySlots/types';
import { DailyGoal } from './DailyGoal';

type SubtaskSlotItemProps = { slot: SubtaskSlot };

export function SubtaskSlotItem({ slot }: SubtaskSlotItemProps) {
  const { useValue, setValue } = useStorageContext();
  const { value: subtask } = useValue<BaseSubtask>(slot.subtaskPath);
  const { value: project } = useValue<BaseProject>(slot.projectPath);
  if (!subtask || !project) {
    return null;
  }

  return (
    <DailyGoal
      task={subtask}
      project={project}
      onToggle={() =>
        setValue(
          `${slot.subtaskPath}/status`,
          subtask.status === 'done' ? 'ready' : 'done',
        )
      }
    />
  );
}
