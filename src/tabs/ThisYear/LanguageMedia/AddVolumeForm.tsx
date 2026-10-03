import { AddItemForm } from './AddItemForm';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { readNumber, readText } from './fields';
import { findNextNumber, NewItem, NO_COMPREHENSION } from './newItems';
import { Volume } from './types';

export function AddVolumeForm({
  volumes,
  isNameRequired,
  onAdd,
}: {
  volumes?: Record<string, Volume>;
  isNameRequired: boolean;
  onAdd: (volume: NewItem<Volume>) => void;
}) {
  return (
    <AddItemForm
      label="Add volume"
      onSubmit={(data) =>
        onAdd({
          number: findNextNumber(volumes),
          name: readText(data, 'name'),
          pages: readNumber(data, 'pages'),
          ...NO_COMPREHENSION,
        })
      }
    >
      <TextField label="Name" name="name" isRequired={isNameRequired} />
      <NumberField label="Pages" name="pages" isRequired />
    </AddItemForm>
  );
}
