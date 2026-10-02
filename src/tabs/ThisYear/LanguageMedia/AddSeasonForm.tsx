import { AddItemForm } from './AddItemForm';
import { NumberField } from './NumberField';
import { readNumber } from './fields';
import { findNextNumber, NewItem, NO_COMPREHENSION } from './newItems';
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
      <NumberField label="Episodes" name="episodes" min={0} />
    </AddItemForm>
  );
}
