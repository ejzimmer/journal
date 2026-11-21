import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import {
  AmimonoProject,
  AmimonoSubtask,
  ProjectDetails,
  ProjectSubtask,
} from '../../types';
import { GlowingEmoji } from '../Todo/Today/GlowingEmoji';

type DailyGoalProps = {
  task: ProjectSubtask | AmimonoSubtask;
  project: ProjectDetails | AmimonoProject;
  onToggle: () => void;
};

export function DailyGoal({ task, project, onToggle }: DailyGoalProps) {
  const projectName = 'name' in project ? project.name : project.description;
  const description = `${projectName}: ${task.description}`;
  const isDone = task.status === 'done';

  return (
    <li
      className={`today-task item today-slot status-${isDone ? 'done' : 'ready'}`}
    >
      <div className="today-task-description">
        <EmojiCheckbox
          emoji={<GlowingEmoji emoji={task.category} />}
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
