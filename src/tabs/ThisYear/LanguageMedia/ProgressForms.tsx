import { DisclosureForm } from './DisclosureForm';
import { DurationField, NumberField, readDuration, readNumber } from './fields';
import { STATUS_NAMES } from './format';
import { PrintSeries, Status, STATUSES, TvSeries } from './types';

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

export function PrintSeriesUpToForm({
  upTo,
  onChange,
}: {
  upTo: PrintSeries['upTo'];
  onChange: (upTo: PrintSeries['upTo']) => void;
}) {
  return (
    <DisclosureForm
      summary="Update"
      label="Update where I'm up to"
      onSubmit={(data) =>
        onChange({
          volume: readNumber(data, 'volume')!,
          chapter: readNumber(data, 'chapter')!,
          page: readNumber(data, 'page')!,
        })
      }
    >
      <NumberField
        label="Volume"
        name="volume"
        defaultValue={upTo?.volume}
        isRequired
      />
      <NumberField
        label="Chapter"
        name="chapter"
        defaultValue={upTo?.chapter}
        isRequired
      />
      <NumberField
        label="Page"
        name="page"
        defaultValue={upTo?.page}
        isRequired
      />
    </DisclosureForm>
  );
}

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

export function StatusSelect({
  name,
  status = 'not-started',
  onChange,
}: {
  name: string;
  status?: Status;
  onChange: (status: Status) => void;
}) {
  return (
    <select
      aria-label={`Status of ${name}`}
      value={status}
      onChange={(event) => onChange(event.target.value as Status)}
    >
      {STATUSES.map((option) => (
        <option key={option} value={option}>
          {STATUS_NAMES[option]}
        </option>
      ))}
    </select>
  );
}
