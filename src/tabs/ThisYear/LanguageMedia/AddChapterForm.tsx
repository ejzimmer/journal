import { AddItemForm } from './AddItemForm';
import {
  findNextNumber,
  NewItem,
  NO_COMPREHENSION,
  readNumber,
  readText,
} from './newItems';
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
      <label>
        Name
        <input name="name" />
      </label>
      <label>
        Last page
        <input name="lastPage" type="number" min="1" />
      </label>
    </AddItemForm>
  );
}
