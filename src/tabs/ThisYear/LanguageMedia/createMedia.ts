import { NewMedia, UnsavedMedia } from './types';

const createNumbers = (count: number) =>
  Array.from({ length: count }, (_, index) => index + 1);

export function createMedia(newMedia: NewMedia): UnsavedMedia {
  const { name, language } = newMedia;

  switch (newMedia.type) {
    case 'tv':
      return {
        type: 'tv',
        name,
        language,
        seasons: createNumbers(newMedia.seasonCount ?? 0).map((number) => ({
          number,
        })),
      };
    case 'youtube':
      return { type: 'youtube', name, language };
    case 'manga':
      return {
        type: 'manga',
        name,
        language,
        volumes: createNumbers(newMedia.volumeCount ?? 0).map((number) => ({
          number,
        })),
      };
    case 'book':
      return {
        type: 'book',
        name,
        language,
        volumes: (newMedia.volumeNames ?? []).map((volumeName, index) => ({
          number: index + 1,
          name: volumeName,
        })),
      };
  }
}
