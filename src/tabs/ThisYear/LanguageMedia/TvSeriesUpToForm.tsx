import { DisclosureForm } from './DisclosureForm';
import { DurationField } from './DurationField';
import { NumberField } from './NumberField';
import { readDuration, readNumber } from './fields';
import { TvSeries } from './types';

export function TvSeriesUpToForm({
  upTo,
  onChange,
}: {
  upTo: TvSeries['upTo'];
  onChange: (upTo: TvSeries['upTo']) => void;
}) {
  return (
    <DisclosureForm
      summary="Update"
      label="Update where I'm up to"
      onSubmit={(data) =>
        onChange({
          season: readNumber(data, 'season')!,
          episode: readNumber(data, 'episode')!,
          timestampInSeconds: readDuration(data, 'timestamp') ?? 0,
        })
      }
    >
      <NumberField
        label="Season"
        name="season"
        defaultValue={upTo?.season}
        isRequired
      />
      <NumberField
        label="Episode"
        name="episode"
        defaultValue={upTo?.episode}
        isRequired
      />
      <DurationField
        label="Timestamp"
        name="timestamp"
        defaultValue={upTo?.timestampInSeconds}
        durationFormat="mm:ss"
      />
    </DisclosureForm>
  );
}
