import { useEffect, useRef, useState } from 'react';
import { CategoryCombobox } from '../CategoryCombobox';

type TodayTaskEditorProps = {
  category: string;
  description: string;
  onChangeCategory: (category: string) => void;
  onChangeDescription: (description: string) => void;
  onClose: () => void;
};

export function TodayTaskEditor({
  category,
  description,
  onChangeCategory,
  onChangeDescription,
  onClose,
}: TodayTaskEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(description);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      className="today-task-description"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && inputValue !== description) {
          onChangeDescription(inputValue);
        }

        if (['Enter', 'Escape'].includes(event.key)) {
          // onClose swaps this editor for the description button and focuses
          // it before this keydown ends, so Enter would then click the button.
          event.preventDefault();
          onClose();
        }
      }}
    >
      <CategoryCombobox
        value={category}
        onChange={(category) => {
          onChangeCategory(category);
          onClose();
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
