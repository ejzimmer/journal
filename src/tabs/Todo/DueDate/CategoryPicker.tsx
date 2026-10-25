import { useContext, useMemo } from 'react';
import { CategoriesContext } from '..';
import { Combobox } from '../../../shared/controls/combobox/Combobox';
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

  const categories = useContext(CategoriesContext);
  const categoryOptions = useMemo(
    () =>
      (categories ?? []).map((category) => ({ id: category, label: category })),
    [categories],
  );

  if (isPicking) {
    return (
      <div onKeyDown={closeFormOnEscape}>
        <Combobox
          value={{ id: category, label: category }}
          options={categoryOptions}
          createOption={(value) => ({ id: value, label: value })}
          onChange={(value) => {
            onChange(value.id);
            stopPicking();
          }}
          onDismiss={stopPicking}
          inputSize={1}
          ariaLabel="Category"
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
