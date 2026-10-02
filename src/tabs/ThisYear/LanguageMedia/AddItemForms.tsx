import { PlusIcon } from '../../../shared/icons/Plus';
import { ReactNode } from 'react';
import { parseDuration } from './format';
import { Chapter, Episode, Season, Video, Volume } from './types';

const NO_COMPREHENSION = { lookups: 0, aiQuestions: 0 };

const findNextNumber = (items: Record<string, { number: number }> = {}) =>
  Math.max(0, ...Object.values(items).map(({ number }) => number)) + 1;

type NewItem<T> = Omit<T, 'id'>;

const readText = (data: FormData, name: string) =>
  String(data.get(name) ?? '').trim() || undefined;

const readNumber = (data: FormData, name: string) =>
  Number(data.get(name)) || undefined;

const readDuration = (data: FormData, name: string) => {
  const duration = readText(data, name);
  return duration === undefined ? undefined : parseDuration(duration);
};

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
      <button type="submit" aria-label={label}>
        <PlusIcon width="16px" />
      </button>
    </form>
  );
}

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

export function AddVolumeForm({
  volumes,
  isNameRequired,
  onAdd,
}: {
  volumes?: Record<string, Volume>;
  isNameRequired: boolean;
  onAdd: (volume: NewItem<Volume>) => void;
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
      <label>
        Name
        <input name="name" required={isNameRequired} />
      </label>
      <label>
        Pages
        <input name="pages" type="number" min="1" />
      </label>
    </AddItemForm>
  );
}

export function AddChapterForm({
  chapters,
  onAdd,
}: {
  chapters?: Record<string, Chapter>;
  onAdd: (chapter: NewItem<Chapter>) => void;
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
      <label>
        Name
        <input name="name" />
      </label>
      <label>
        Last page
        <input name="lastPage" type="number" min="1" />
      </label>
    </AddItemForm>
  );
}
