import { useEffect } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { getLanguageMediaPath, PrintSeries, Volume } from './types';

const LEGACY_YEAR = 2026;
export const LEGACY_GOALS_PATH = `${LEGACY_YEAR}/other_goals`;

type LegacyBook = {
  title: string;
  volumes: { totalPages: number; readPages?: number }[];
};

type LegacyBookEntry = [id: string, book: LegacyBook];

const JAPANESE_SCRIPT =
  /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

const isLegacyBook = (goal: unknown): goal is LegacyBook =>
  typeof goal === 'object' &&
  goal !== null &&
  'title' in goal &&
  'volumes' in goal &&
  Array.isArray(goal.volumes);

const isJapanese = ([, book]: LegacyBookEntry) =>
  JAPANESE_SCRIPT.test(book.title);

function findSharedLeadingWords(titles: string[]) {
  const [first, ...rest] = titles.map((title) => title.trim().split(/\s+/));
  const end = first.findIndex((word, index) =>
    rest.some((words) => words[index] !== word),
  );
  return (end === -1 ? first : first.slice(0, end)).join(' ');
}

function createVolumes(
  entries: LegacyBookEntry[],
  type: PrintSeries['type'],
  at: string,
) {
  return entries
    .flatMap(([id, book]) =>
      book.volumes.map((volume, index) => ({
        id: `${id}-${index + 1}`,
        name:
          book.volumes.length > 1 ? `${book.title} ${index + 1}` : book.title,
        pages: volume.totalPages,
        readPages: volume.readPages ?? 0,
      })),
    )
    .map(({ id, name, pages, readPages }, index) => {
      const isDone = pages > 0 && readPages >= pages;
      const volume: Volume = {
        id,
        number: index + 1,
        ...(type === 'book' && { name }),
        pages,
        lookups: 0,
        aiQuestions: 0,
        createdAt: at,
        ...(isDone && {
          status: 'done',
          updates: { migration: { at, changes: { status: { to: 'done' } } } },
        }),
      };
      return { volume, readPages };
    });
}

function createSeries(
  entries: LegacyBookEntry[],
  type: PrintSeries['type'],
  at: string,
): PrintSeries {
  const [[id, firstBook]] = entries;
  const language = type === 'manga' ? 'japanese' : 'french';
  const volumes = createVolumes(entries, type, at);
  const lastStarted = volumes.findLast(({ readPages }) => readPages > 0);
  const upTo = lastStarted && {
    volume: lastStarted.volume.number,
    page: lastStarted.readPages,
  };

  return {
    id,
    type,
    name:
      findSharedLeadingWords(entries.map(([, book]) => book.title)) ||
      firstBook.title,
    language,
    createdAt: at,
    volumes: Object.fromEntries(
      volumes.map(({ volume }) => [volume.id, volume]),
    ),
    ...(upTo && {
      upTo,
      updates: { migration: { at, changes: { upTo: { to: upTo } } } },
    }),
  };
}

export function createReadingGoalMigration(
  legacyGoals: Record<string, unknown> = {},
  at: string,
): Record<string, unknown> {
  const books = Object.entries(legacyGoals).filter(
    (entry): entry is LegacyBookEntry => isLegacyBook(entry[1]),
  );
  if (books.length === 0) {
    return {};
  }

  const groups = [
    {
      type: 'book' as const,
      entries: books.filter((book) => !isJapanese(book)),
    },
    { type: 'manga' as const, entries: books.filter(isJapanese) },
  ].filter(({ entries }) => entries.length > 0);

  const seriesUpdates = groups.map(({ type, entries }) => {
    const series = createSeries(entries, type, at);
    return [`${getLanguageMediaPath(LEGACY_YEAR)}/${series.id}`, series];
  });
  const removals = books.map(([id]) => [`${LEGACY_GOALS_PATH}/${id}`, null]);

  return Object.fromEntries([...seriesUpdates, ...removals]);
}

export function useReadingGoalMigration() {
  const { useValue, setValues } = useStorageContext();
  const { value: legacyGoals } =
    useValue<Record<string, unknown>>(LEGACY_GOALS_PATH);

  useEffect(() => {
    const updates = createReadingGoalMigration(
      legacyGoals,
      Temporal.Now.instant().toString(),
    );
    if (Object.keys(updates).length > 0) {
      setValues(updates);
    }
  }, [legacyGoals, setValues]);
}
