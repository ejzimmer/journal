import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { GlowingEmoji } from '../Todo/Today/GlowingEmoji';

type SubtaskSlotContentProps = {
  emoji: string;
  description: string;
  isDone: boolean;
  onToggle: () => void;
};

export function SubtaskSlotContent({
  emoji,
  description,
  isDone,
  onToggle,
}: SubtaskSlotContentProps) {
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
