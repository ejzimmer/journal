import { useEffect, useRef, useState } from 'react';
import { EmojiCheckbox } from '../../../shared/controls/EmojiCheckbox';
import { CategoryCombobox } from '../CategoryCombobox';
import { useFormToggle } from '../../../shared/controls/useFormToggle';

type Change =
  { isChecked: boolean } | { category: string } | { description: string };

type TodayTaskDescriptionProps = {
  category: string;
  description: string;
  isChecked: boolean;
  onChange: (change: Change) => void;
};

export function TodayTaskDescription({
  category,
  description,
  isChecked,
  onChange,
}: TodayTaskDescriptionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    isFormOpen: inEditMode,
    triggerRef: displayRef,
    openForm: startEditing,
    closeForm: stopEditing,
    openFormOnEnterOrSpace,
  } = useFormToggle<HTMLDivElement>();
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
        onKeyDown={({ key }) => {
          if (key === 'Enter' && inputValue !== description) {
            onChange({ description: inputValue });
          }

          if (['Enter', 'Escape'].includes(key)) {
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

  return (
    <div className="today-task-description">
      <EmojiCheckbox
        emoji={category}
        isChecked={isChecked}
        label={`${description} done`}
        onChange={() => onChange({ isChecked: !isChecked })}
        useTickForDone
      />
      <div
        ref={displayRef}
        role="button"
        tabIndex={0}
        aria-label={description}
        onClick={startEditing}
        onKeyDown={openFormOnEnterOrSpace}
      >
        {description}
      </div>
    </div>
  );
}
