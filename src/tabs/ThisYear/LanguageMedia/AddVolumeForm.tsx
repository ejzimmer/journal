import { AddItemForm } from './AddItemForm';
import { findNextNumber, NewItem, readNumber, readText } from './newItems';
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
        })
      }
    >
      <label>
        Name
        <input name="name" required={isNameRequired} />
      </label>
      <label>
        Pages
        <input name="pages" type="number" min="1" />
      </label>
    </AddItemForm>
  );
}
