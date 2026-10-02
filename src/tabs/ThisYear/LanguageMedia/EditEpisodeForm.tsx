import { DurationField } from './DurationField';
import { EditItemForm } from './EditItemForm';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { readDuration, readRequiredNumber, readText } from './fields';
import { Episode } from './types';

export function EditEpisodeForm({
  name,
  episode,
  onChange,
}: {
  name: string;
  episode: Episode;
  onChange: (changes: Partial<Episode>) => void;
}) {
  return (
    <EditItemForm
      name={name}
      onSubmit={(data) =>
        onChange({
          number: readRequiredNumber(data, 'number', episode.number),
          name: readText(data, 'name'),
          lengthInSeconds: readDuration(data, 'length'),
        })
      }
    >
      <NumberField
        label="Number"
        name="number"
        defaultValue={episode.number}
        isRequired
      />
      <TextField label="Name" name="name" defaultValue={episode.name} />
      <DurationField
        label="Length"
        name="length"
        defaultValue={episode.lengthInSeconds}
        durationFormat="mm:ss"
      />
    </EditItemForm>
  );
}
