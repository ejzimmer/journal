import { EditItemForm } from './EditItemForm';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { readNumber, readRequiredNumber, readText } from './fields';
import { Volume } from './types';

export function EditVolumeForm({
  name,
  volume,
  isNameRequired,
  onChange,
}: {
  name: string;
  volume: Volume;
  isNameRequired: boolean;
  onChange: (changes: Partial<Volume>) => void;
}) {
  return (
    <EditItemForm
      name={name}
      onSubmit={(data) =>
        onChange({
          number: readRequiredNumber(data, 'number', volume.number),
          name: readText(data, 'name'),
          pages: readNumber(data, 'pages'),
        })
      }
    >
      <NumberField
        label="Number"
        name="number"
        defaultValue={volume.number}
        isRequired
      />
      <TextField
        label="Name"
        name="name"
        defaultValue={volume.name}
        isRequired={isNameRequired}
      />
      <NumberField label="Pages" name="pages" defaultValue={volume.pages} />
    </EditItemForm>
  );
}
