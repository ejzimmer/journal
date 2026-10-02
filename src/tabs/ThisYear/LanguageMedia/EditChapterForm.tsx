import { EditItemForm } from './EditItemForm';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { readNumber, readRequiredNumber, readText } from './fields';
import { Chapter } from './types';

export function EditChapterForm({
  name,
  chapter,
  onChange,
}: {
  name: string;
  chapter: Chapter;
  onChange: (changes: Partial<Chapter>) => void;
}) {
  return (
    <EditItemForm
      name={name}
      onSubmit={(data) =>
        onChange({
          number: readRequiredNumber(data, 'number', chapter.number),
          name: readText(data, 'name'),
          lastPage: readNumber(data, 'lastPage'),
        })
      }
    >
      <NumberField
        label="Number"
        name="number"
        defaultValue={chapter.number}
        isRequired
      />
      <TextField label="Name" name="name" defaultValue={chapter.name} />
      <NumberField
        label="Last page"
        name="lastPage"
        defaultValue={chapter.lastPage}
      />
    </EditItemForm>
  );
}
