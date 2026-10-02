import { DisclosureForm } from './DisclosureForm';
import { DurationField } from './DurationField';
import { readDuration } from './fields';

export function VideoUpToForm({
  name,
  upToInSeconds,
  onChange,
}: {
  name: string;
  upToInSeconds?: number;
  onChange: (upToInSeconds?: number) => void;
}) {
  return (
    <DisclosureForm
      summary="Update"
      label={`Update where I'm up to in ${name}`}
      onSubmit={(data) => onChange(readDuration(data, 'timestamp'))}
    >
      <DurationField
        label="Timestamp"
        name="timestamp"
        defaultValue={upToInSeconds}
        durationFormat="hh:mm:ss"
      />
    </DisclosureForm>
  );
}
