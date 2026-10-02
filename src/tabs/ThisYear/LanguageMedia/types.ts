export const LANGUAGE_MEDIA_PATH = 'language_media';

export const getLanguageMediaPath = (year: number) =>
  `${LANGUAGE_MEDIA_PATH}/${year}`;

export const LANGUAGES = ['french', 'japanese'] as const;
export type Language = (typeof LANGUAGES)[number];

export const MEDIA_TYPES = ['book', 'manga', 'youtube', 'tv'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const STATUSES = ['not-started', 'in-progress', 'done'] as const;
export type Status = (typeof STATUSES)[number];

export type Comprehension = {
  lookups: number;
  aiQuestions: number;
  understood?: number;
};

export type Episode = Comprehension & {
  id: string;
  number: number;
  name?: string;
  lengthInSeconds?: number;
  status?: Status;
};

export type Season = {
  id: string;
  number: number;
  episodes?: Record<string, Episode>;
};

export type TvSeries = {
  id: string;
  type: 'tv';
  name: string;
  language: Language;
  seasons?: Record<string, Season>;
  upTo?: { season: number; episode: number; timestampInSeconds: number };
};

export type Video = Comprehension & {
  id: string;
  url: string;
  lengthInSeconds?: number;
  upToInSeconds?: number;
  status?: Status;
};

export type YoutubeChannel = {
  id: string;
  type: 'youtube';
  name: string;
  language: Language;
  videos?: Record<string, Video>;
};

export type Volume = Comprehension & {
  id: string;
  number: number;
  name?: string;
  pages?: number;
  status?: Status;
};

export type PrintSeries = {
  id: string;
  type: 'manga' | 'book';
  name: string;
  language: Language;
  volumes?: Record<string, Volume>;
  upTo?: { volume: number; page: number };
};

export type LanguageMedia = TvSeries | YoutubeChannel | PrintSeries;

export type ItemPath = string[];

type NewMediaDetails = { name: string; language: Language };

export type NewMedia =
  | (NewMediaDetails & { type: 'tv'; seasonCount?: number })
  | (NewMediaDetails & { type: 'youtube' })
  | (NewMediaDetails & { type: 'manga'; volumeCount?: number })
  | (NewMediaDetails & { type: 'book'; volumeNames?: string[] });

export type StoredMediaByYear = Record<string, Record<string, LanguageMedia>>;
