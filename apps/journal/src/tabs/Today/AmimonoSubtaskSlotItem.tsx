import { useStorageContext } from 'shared/FirebaseContext';
import { SubtaskSlot } from 'shared/todaySlots/types';
import { AmimonoProject, AmimonoSubtask } from '../../types';
import { getProjectPath } from './slots';
import { SubtaskSlotContent } from './SubtaskSlotContent';

type AmimonoSubtaskSlotItemProps = { slot: SubtaskSlot };

export function AmimonoSubtaskSlotItem({ slot }: AmimonoSubtaskSlotItemProps) {
  const { useValue, setValue } = useStorageContext();
  const { value: subtask } = useValue<AmimonoSubtask>(slot.subtaskPath);
  const { value: project } = useValue<AmimonoProject>(
    getProjectPath(slot.subtaskPath),
  );
  if (!subtask || !project) {
    return null;
  }

  const isDone = subtask.status === 'done';

  return (
    <SubtaskSlotContent
      emoji="🧶"
      description={`${project.name}: ${subtask.description}`}
      isDone={isDone}
      onToggle={() =>
        setValue(`${slot.subtaskPath}/status`, isDone ? 'ready' : 'done')
      }
    />
  );
}
