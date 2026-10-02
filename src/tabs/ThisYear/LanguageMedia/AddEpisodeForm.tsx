import { AddItemForm } from './AddItemForm';
import { DurationField } from './DurationField';
import { TextField } from './TextField';
import { readDuration, readText } from './fields';
import { findNextNumber, NewItem, NO_COMPREHENSION } from './newItems';
import { Episode } from './types';

export function AddEpisodeForm({
  episodes,
  onAdd,
}: {
  episodes?: Record<string, Episode>;
  onAdd: (episode: NewItem<Episode>) => void;
}) {
  return (
    <AddItemForm
      label="Add episode"
      onSubmit={(data) =>
        onAdd({
          number: findNextNumber(episodes),
          name: readText(data, 'name'),
          lengthInSeconds: readDuration(data, 'length'),
          ...NO_COMPREHENSION,
        })
      }
    >
      <TextField label="Name" name="name" />
      <DurationField label="Length" name="length" durationFormat="mm:ss" />
    </AddItemForm>
  );
}
