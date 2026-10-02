import { AddItemForm } from './AddItemForm';
import { DurationField } from './DurationField';
import { TextField } from './TextField';
import { readDuration } from './fields';
import { NewItem, NO_COMPREHENSION } from './newItems';
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
      <TextField label="URL" name="url" type="url" isRequired />
      <DurationField label="Length" name="length" durationFormat="hh:mm:ss" />
    </AddItemForm>
  );
}
