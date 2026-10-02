import { ReactNode } from 'react';
import {
  DurationField,
  NumberField,
  readDuration,
  readNumber,
  readText,
  TextField,
} from './fields';
import { Chapter, Episode, Season, Video, Volume } from './types';

const NO_COMPREHENSION = { lookups: 0, aiQuestions: 0 };

const findNextNumber = (items: { number: number }[] = []) =>
  Math.max(0, ...items.map(({ number }) => number)) + 1;

function AddItemForm({
  label,
  onSubmit,
  children,
}: {
  label: string;
  onSubmit: (data: FormData) => void;
  children: ReactNode;
}) {
  const submitItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
    event.currentTarget.reset();
  };

  return (
    <form aria-label={label} onSubmit={submitItem}>
      {children}
      <button type="submit">{label}</button>
    </form>
  );
}

export function AddSeasonForm({
  seasons,
  onAdd,
}: {
  seasons?: Season[];
  onAdd: (season: Season) => void;
}) {
  return (
    <AddItemForm
      label="Add season"
      onSubmit={(data) =>
        onAdd({
          number: findNextNumber(seasons),
          episodes: Array.from(
            { length: readNumber(data, 'episodes') ?? 0 },
            (_, index) => ({ number: index + 1, ...NO_COMPREHENSION }),
          ),
        })
      }
    >
      <NumberField label="Episodes" name="episodes" min={0} />
    </AddItemForm>
  );
}

export function AddEpisodeForm({
  episodes,
  onAdd,
}: {
  episodes?: Episode[];
  onAdd: (episode: Episode) => void;
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
      <TextField label="Name" name="name" />
      <DurationField label="Length" name="length" durationFormat="mm:ss" />
    </AddItemForm>
  );
}

export function AddVideoForm({ onAdd }: { onAdd: (video: Video) => void }) {
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

export function AddVolumeForm({
  volumes,
  isNameRequired,
  onAdd,
}: {
  volumes?: Volume[];
  isNameRequired: boolean;
  onAdd: (volume: Volume) => void;
}) {
  return (
    <AddItemForm
      label="Add volume"
      onSubmit={(data) =>
        onAdd({
          number: findNextNumber(volumes),
          name: readText(data, 'name'),
          pages: readNumber(data, 'pages'),
        })
      }
    >
      <TextField label="Name" name="name" isRequired={isNameRequired} />
      <NumberField label="Pages" name="pages" />
    </AddItemForm>
  );
}

export function AddChapterForm({
  chapters,
  onAdd,
}: {
  chapters?: Chapter[];
  onAdd: (chapter: Chapter) => void;
}) {
  return (
    <AddItemForm
      label="Add chapter"
      onSubmit={(data) =>
        onAdd({
          number: findNextNumber(chapters),
          name: readText(data, 'name'),
          lastPage: readNumber(data, 'lastPage'),
          ...NO_COMPREHENSION,
        })
      }
    >
      <TextField label="Name" name="name" />
      <NumberField label="Last page" name="lastPage" />
    </AddItemForm>
  );
}
