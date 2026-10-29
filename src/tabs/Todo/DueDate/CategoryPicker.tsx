import { CategoryCombobox } from '../CategoryCombobox';
import { useFormToggle } from '../../../shared/controls/useFormToggle';

type CategoryPickerProps = {
  category: string;
  onChange: (category: string) => void;
};

export function CategoryPicker({ category, onChange }: CategoryPickerProps) {
  const {
    isFormOpen: isPicking,
    triggerRef,
    openForm: startPicking,
    closeForm: stopPicking,
    closeFormOnEscape,
  } = useFormToggle();

  if (isPicking) {
    return (
      <div onKeyDown={closeFormOnEscape}>
        <CategoryCombobox
          value={category}
          onChange={(category) => {
            onChange(category);
            stopPicking();
          }}
          onDismiss={stopPicking}
          autoFocus
        />
      </div>
    );
  }

  return (
    <button
      ref={triggerRef}
      className="category-button"
      aria-label="Category"
      onClick={startPicking}
    >
      {category}
    </button>
  );
}
