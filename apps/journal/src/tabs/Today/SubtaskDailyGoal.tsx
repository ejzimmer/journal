import { useStorageContext } from 'shared/FirebaseContext';
import { BaseProject, BaseSubtask } from 'shared/projects/types';
import { SubtaskGoal } from 'shared/dailyGoals/types';
import { DailyGoal } from './DailyGoal';

type SubtaskDailyGoalProps = { goal: SubtaskGoal };

export function SubtaskDailyGoal({ goal }: SubtaskDailyGoalProps) {
  const { useValue, setValue } = useStorageContext();
  const { value: subtask } = useValue<BaseSubtask>(goal.subtaskPath);
  const { value: project } = useValue<BaseProject>(goal.projectPath);
  if (!subtask || !project) {
    return null;
  }

  return (
    <DailyGoal
      task={subtask}
      project={project}
      onToggle={() =>
        setValue(
          `${goal.subtaskPath}/status`,
          subtask.status === 'done' ? 'ready' : 'done',
        )
      }
    />
  );
}
