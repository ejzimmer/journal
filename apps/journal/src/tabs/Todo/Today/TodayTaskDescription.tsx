import { useEffect, useRef, useState } from 'react';
import { EmojiCheckbox } from 'shared/controls/EmojiCheckbox';
import { CategoryCombobox } from '../CategoryCombobox';
import { GlowingEmoji } from './GlowingEmoji';
import { useFormToggle } from 'shared/controls/useFormToggle';
import { ReorderControls } from '../todoTypes';
import { ReorderableGroup } from './ReorderableGroup';

type Change =
  { isChecked: boolean } | { category: string } | { description: string };

type TodayTaskDescriptionProps = {
  category: string;
  description: string;
  isChecked: boolean;
  onChange: (change: Change) => void;
  reorder?: ReorderControls;
};

export function TodayTaskDescription({
  category,
  description,
  isChecked,
  onChange,
  reorder,
}: TodayTaskDescriptionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    isFormOpen: inEditMode,
    triggerRef: displayRef,
    openForm: startEditing,
    closeForm: stopEditing,
  } = useFormToggle();
  const [inputValue, setInputValue] = useState(description);

  useEffect(() => {
    if (inputRef.current && inEditMode) {
      inputRef.current.focus();
    }
  }, [inEditMode]);

  if (inEditMode) {
    return (
      <div
        className="today-task-description"
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            // stopEditing flushes the render that swaps the input for the
            // description button and focuses it, so Enter would then click it.
            event.preventDefault();
          }

          if (event.key === 'Enter' && inputValue !== description) {
            onChange({ description: inputValue });
          }

          if (['Enter', 'Escape'].includes(event.key)) {
            stopEditing();
          }
        }}
      >
        <CategoryCombobox
          value={category}
          onChange={(category) => {
            onChange({ category });
            stopEditing();
          }}
        />
        <input
          className="subtle"
          ref={inputRef}
          aria-label="Description"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          size={inputValue.length}
        />
      </div>
    );
  }

  const viewControls = (
    <>
      <EmojiCheckbox
        emoji={<GlowingEmoji emoji={category} />}
        isChecked={isChecked}
        label={`${description} done`}
        onChange={() => onChange({ isChecked: !isChecked })}
        useTickForDone
      />
      <button
        ref={displayRef}
        className="description-button"
        onClick={startEditing}
      >
        {description}
      </button>
    </>
  );

  return reorder ? (
    <ReorderableGroup
      className="today-task-description"
      label={description}
      reorder={reorder}
    >
      {viewControls}
    </ReorderableGroup>
  ) : (
    <div className="today-task-description">{viewControls}</div>
  );
}
