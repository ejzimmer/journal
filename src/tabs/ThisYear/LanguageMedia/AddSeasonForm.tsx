import { AddItemForm } from './AddItemForm';
import {
  findNextNumber,
  NewItem,
  NO_COMPREHENSION,
  readNumber,
} from './newItems';
import { Episode, Season } from './types';

export function AddSeasonForm({
  seasons,
  onAdd,
}: {
  seasons?: Record<string, Season>;
  onAdd: (season: NewItem<Season>, episodes: NewItem<Episode>[]) => void;
}) {
  return (
    <AddItemForm
      label="Add season"
      onSubmit={(data) =>
        onAdd(
          { number: findNextNumber(seasons) },
          Array.from(
            { length: readNumber(data, 'episodes') ?? 0 },
            (_, index) => ({
              number: index + 1,
              ...NO_COMPREHENSION,
            }),
          ),
        )
      }
    >
      <label>
        Episodes
        <input name="episodes" type="number" min="0" />
      </label>
    </AddItemForm>
  );
}
