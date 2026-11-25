import { Ref } from 'react';
import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { GlowingEmoji } from './GlowingEmoji';

type TodayTaskViewProps = {
  category: string;
  description: string;
  isChecked: boolean;
  descriptionRef: Ref<HTMLButtonElement>;
  onToggle: () => void;
  onEdit: () => void;
};

export function TodayTaskView({
  category,
  description,
  isChecked,
  descriptionRef,
  onToggle,
  onEdit,
}: TodayTaskViewProps) {
  return (
    <>
      <EmojiCheckbox
        emoji={<GlowingEmoji emoji={category} />}
        isChecked={isChecked}
        label={`${description} done`}
        onChange={onToggle}
        useTickForDone
      />
      <button
        ref={descriptionRef}
        className="description-button"
        onClick={onEdit}
      >
        {description}
      </button>
    </>
  );
}
