import { useEffect, useRef, useState } from 'react';
import { InlineEditor } from 'shared/controls/InlineEditor';
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
    <InlineEditor
      className="today-task-description"
      onSave={() => {
        if (inputValue !== description) {
          onChangeDescription(inputValue);
        }
      }}
      onClose={onClose}
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
    </InlineEditor>
  );
}
