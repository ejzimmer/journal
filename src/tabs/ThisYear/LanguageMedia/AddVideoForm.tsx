import { AddItemForm } from './AddItemForm';
import { NewItem, NO_COMPREHENSION, readDuration } from './newItems';
import { Video } from './types';

export function AddVideoForm({
  onAdd,
}: {
  onAdd: (video: NewItem<Video>) => void;
}) {
  return (
    <AddItemForm
      label="Add video"
      onSubmit={(data) =>
        onAdd({
          url: String(data.get('url')),
          lengthInSeconds: readDuration(data, 'length'),
          ...NO_COMPREHENSION,
        })
      }
    >
      <label>
        URL
        <input name="url" type="url" required />
      </label>
      <label>
        Length
        <input name="length" pattern="\d+:\d{2}:\d{2}" />
      </label>
    </AddItemForm>
  );
}
