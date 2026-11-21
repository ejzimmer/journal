import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { BaseProject, BaseSubtask } from 'shared/projects/types';
import { GlowingEmoji } from '../Todo/Today/GlowingEmoji';

type DailyGoalProps = {
  task: BaseSubtask;
  project: BaseProject;
  onToggle: () => void;
};

export function DailyGoal({ task, project, onToggle }: DailyGoalProps) {
  const description = `${project.description}: ${task.description}`;
  const isDone = task.status === 'done';

  return (
    <li
      className={`today-task item today-slot status-${isDone ? 'done' : 'ready'}`}
    >
      <div className="today-task-description">
        <EmojiCheckbox
          emoji={<GlowingEmoji emoji={project.category} />}
          isChecked={isDone}
          label={`${description} done`}
          onChange={onToggle}
          useTickForDone
        />
        <div className="task-screen">{description}</div>
      </div>
    </li>
  );
}
