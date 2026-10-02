import { EditItemForm } from './EditItemForm';
import { NumberField } from './NumberField';
import { readRequiredNumber } from './fields';
import { Season } from './types';

export function EditSeasonForm({
  name,
  season,
  onChange,
}: {
  name: string;
  season: Season;
  onChange: (changes: Partial<Season>) => void;
}) {
  return (
    <EditItemForm
      name={name}
      onSubmit={(data) =>
        onChange({
          number: readRequiredNumber(data, 'number', season.number),
        })
      }
    >
      <NumberField
        label="Number"
        name="number"
        defaultValue={season.number}
        isRequired
      />
    </EditItemForm>
  );
}
