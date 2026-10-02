import { DurationField } from './DurationField';
import { AddItemForm } from './AddItemForm';
import {
  findNextNumber,
  NewItem,
  NO_COMPREHENSION,
  readDuration,
  readText,
} from './newItems';
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
      <label>
        Name
        <input name="name" />
      </label>
      <DurationField label="Length" name="length" durationFormat="mm:ss" />
    </AddItemForm>
  );
}
