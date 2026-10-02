import { DurationField } from './DurationField';
import { EditItemForm } from './EditItemForm';
import { TextField } from './TextField';
import { readDuration, readText } from './fields';
import { Video } from './types';

export function EditVideoForm({
  video,
  onChange,
}: {
  video: Video;
  onChange: (changes: Partial<Video>) => void;
}) {
  return (
    <EditItemForm
      name={video.url}
      onSubmit={(data) =>
        onChange({
          url: readText(data, 'url') ?? video.url,
          lengthInSeconds: readDuration(data, 'length'),
        })
      }
    >
      <TextField
        label="URL"
        name="url"
        type="url"
        defaultValue={video.url}
        isRequired
      />
      <DurationField
        label="Length"
        name="length"
        defaultValue={video.lengthInSeconds}
        durationFormat="hh:mm:ss"
      />
    </EditItemForm>
  );
}
