import { BookDetails } from '../types';
import { MediaEditFormProps } from '../MediaSpine';
import { EditMediaForm } from '../EditMediaForm';
import { useBookFormConfig } from './bookFormConfig';

export function EditBookForm({
  item,
  isOpen,
  onCancel,
}: MediaEditFormProps<BookDetails>) {
  return (
    <EditMediaForm
      item={item}
      isOpen={isOpen}
      onCancel={onCancel}
      config={useBookFormConfig()}
    />
  );
}
