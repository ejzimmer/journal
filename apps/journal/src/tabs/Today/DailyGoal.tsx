import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { BaseProject, BaseSubtask } from 'shared/projects/types';
import { DailyTask } from '../../types';
import { GlowingEmoji } from '../Todo/Today/GlowingEmoji';

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
      <div className="today-task-description">
        <EmojiCheckbox
          emoji={<GlowingEmoji emoji={category} />}
          isChecked={task.status !== 'ready'}
          label={`${description} done`}
          onChange={onToggle}
          useTickForDone
        />
        <div className="task-screen">{description}</div>
      </div>
    </li>
  );
}
