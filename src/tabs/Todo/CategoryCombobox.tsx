import { useContext, useMemo } from 'react';
import { CategoriesContext } from '.';
import { Combobox } from '../../shared/controls/combobox/Combobox';

type CategoryComboboxProps = {
  value: string;
  onChange: (category: string) => void;
  autoFocus?: boolean;
  onDismiss?: () => void;
};

export function CategoryCombobox({
  value,
  onChange,
  autoFocus,
  onDismiss,
}: CategoryComboboxProps) {
  const categories = useContext(CategoriesContext);
  if (!categories) {
    throw new Error('Missing categories context provider');
  }
  const categoryOptions = useMemo(
    () => categories.map((category) => ({ id: category, label: category })),
    [categories],
  );

  return (
    <Combobox
      value={{ id: value, label: value }}
      options={categoryOptions}
      createOption={(label) => ({ id: label, label })}
      onChange={(option) => onChange(option.id)}
      inputSize={1}
      ariaLabel="Category"
      autoFocus={autoFocus}
      onDismiss={onDismiss}
    />
  );
}
