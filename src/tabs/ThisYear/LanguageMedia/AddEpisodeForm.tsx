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
      <label>
        Length
        <input name="length" pattern="\d+:\d{2}" />
      </label>
    </AddItemForm>
  );
}
