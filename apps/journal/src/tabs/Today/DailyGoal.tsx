import { BaseProject, BaseSubtask } from 'shared/projects/types';
import { DailyTask } from '../../types';
import { CheckableTask } from './CheckableTask';

type DailyGoalProps = { onToggle: () => void } & (
  | { task: DailyTask; project?: undefined }
  | { task: BaseSubtask; project: BaseProject }
);

export function DailyGoal(props: DailyGoalProps) {
  const { task, onToggle } = props;
  const description = props.project
    ? `${props.project.description}: ${task.description}`
    : task.description;
  const category = props.project ? props.project.category : props.task.category;
  const typeClass = props.project ? '' : `type-${props.task.type}`;

  return (
    <li
      className={`today-task item today-slot status-${task.status} ${typeClass}`}
    >
      <CheckableTask
        category={category}
        description={description}
        isChecked={task.status !== 'ready'}
        onToggle={onToggle}
      />
    </li>
  );
}
