export const LANGUAGE_MEDIA_PATH = '2026/language_media';

export const LANGUAGES = ['french', 'japanese'] as const;
export type Language = (typeof LANGUAGES)[number];

export const MEDIA_TYPES = ['tv', 'youtube', 'manga', 'book'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const STATUSES = ['not-started', 'in-progress', 'done'] as const;
export type Status = (typeof STATUSES)[number];

export type Comprehension = {
  lookups: number;
  aiQuestions: number;
  understood?: number;
};

export type Episode = Comprehension & {
  number: number;
  name?: string;
  lengthInSeconds?: number;
  status?: Status;
};

export type Season = {
  number: number;
  episodes?: Episode[];
};

export type TvSeries = {
  id: string;
  type: 'tv';
  name: string;
  language: Language;
  seasons?: Season[];
  upTo?: { season: number; episode: number; timestampInSeconds: number };
};

export type Video = Comprehension & {
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
  videos?: Video[];
};

export type Chapter = Comprehension & {
  number: number;
  name?: string;
  lastPage?: number;
  status?: Status;
};

export type Volume = {
  number: number;
  name?: string;
  pages?: number;
  chapters?: Chapter[];
};

export type PrintSeries = {
  id: string;
  type: 'manga' | 'book';
  name: string;
  language: Language;
  volumes?: Volume[];
  upTo?: { volume: number; chapter: number; page: number };
};

export type LanguageMedia = TvSeries | YoutubeChannel | PrintSeries;

export type UnsavedMedia =
  Omit<TvSeries, 'id'> | Omit<YoutubeChannel, 'id'> | Omit<PrintSeries, 'id'>;

type NewMediaDetails = { name: string; language: Language };

export type NewMedia =
  | (NewMediaDetails & { type: 'tv'; seasonCount?: number })
  | (NewMediaDetails & { type: 'youtube' })
  | (NewMediaDetails & { type: 'manga'; volumeCount?: number })
  | (NewMediaDetails & { type: 'book'; volumeNames?: string[] });
