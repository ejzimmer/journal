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

const AMIMONO_EMOJI = '🧶';

export function DailyGoal({ task, project, onToggle }: DailyGoalProps) {
  const projectName = 'name' in project ? project.name : project.description;
  const description = `${projectName}: ${task.description}`;
  const emoji = 'category' in task ? task.category : AMIMONO_EMOJI;
  const isDone = task.status === 'done';

  return (
    <li
      className={`today-task item today-slot status-${isDone ? 'done' : 'ready'}`}
    >
      <div className="today-task-description">
        <EmojiCheckbox
          emoji={<GlowingEmoji emoji={emoji} />}
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
