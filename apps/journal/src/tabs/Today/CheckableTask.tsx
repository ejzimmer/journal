import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { GlowingEmoji } from '../Todo/Today/GlowingEmoji';

type CheckableTaskProps = {
  category: string;
  description: string;
  isChecked: boolean;
  onToggle: () => void;
};

export function CheckableTask({
  category,
  description,
  isChecked,
  onToggle,
}: CheckableTaskProps) {
  return (
    <div className="today-task-description">
      <EmojiCheckbox
        emoji={<GlowingEmoji emoji={category} />}
        isChecked={isChecked}
        label={`${description} done`}
        onChange={onToggle}
        useTickForDone
      />
      <div className="task-screen">{description}</div>
    </div>
  );
}
