import { AddItemForm } from './AddItemForm';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { readNumber, readText } from './fields';
import { findNextNumber, NewItem, NO_COMPREHENSION } from './newItems';
import { Chapter } from './types';

export function AddChapterForm({
  chapters,
  onAdd,
}: {
  chapters?: Record<string, Chapter>;
  onAdd: (chapter: NewItem<Chapter>) => void;
}) {
  return (
    <AddItemForm
      label="Add chapter"
      onSubmit={(data) =>
        onAdd({
          number: findNextNumber(chapters),
          name: readText(data, 'name'),
          lastPage: readNumber(data, 'lastPage'),
          ...NO_COMPREHENSION,
        })
      }
    >
      <TextField label="Name" name="name" />
      <NumberField label="Last page" name="lastPage" />
    </AddItemForm>
  );
}
