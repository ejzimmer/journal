import { useStorageContext } from 'shared/FirebaseContext';
import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import {
  ProjectDetails,
  PROJECTS_KEY,
  ProjectSubtask,
  SubtaskSlot,
} from '../../types';
import { GlowingEmoji } from '../Todo/Today/GlowingEmoji';
import { getProjectPath, toggleSubtaskInProject } from './slots';

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

  const description = `${project.description}: ${subtask.description}`;
  const isDone = subtask.status === 'done';

  return (
    <li
      className={`today-task item today-slot status-${isDone ? 'done' : 'ready'}`}
    >
      <div className="today-task-description">
        <EmojiCheckbox
          emoji={<GlowingEmoji emoji={subtask.category} />}
          isChecked={isDone}
          label={`${description} done`}
          onChange={() =>
            updateItem<ProjectDetails>(
              PROJECTS_KEY,
              toggleSubtaskInProject(project, subtask),
            )
          }
          useTickForDone
        />
        <div className="task-screen">{description}</div>
      </div>
    </li>
  );
}
