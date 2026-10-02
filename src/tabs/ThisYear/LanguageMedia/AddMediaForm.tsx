import { useState } from 'react';
import { PlusIcon } from '../../../shared/icons/Plus';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { LANGUAGE_NAMES, MEDIA_TYPE_NAMES } from './names';
import { Language, LANGUAGES, MEDIA_TYPES, MediaType, NewMedia } from './types';

const readCount = (data: FormData, name: string) =>
  Number(data.get(name)) || undefined;

const readAllText = (data: FormData, name: string) =>
  data
    .getAll(name)
    .map((value) => String(value).trim())
    .filter(Boolean);

function readNewMedia(data: FormData): NewMedia {
  const name = String(data.get('name')).trim();
  const language = data.get('language') as Language;
  const type = data.get('type') as MediaType;

  switch (type) {
    case 'tv':
      return { type, name, language, seasonCount: readCount(data, 'seasons') };
    case 'youtube':
      return { type, name, language };
    case 'manga':
      return { type, name, language, volumeCount: readCount(data, 'volumes') };
    case 'book':
      return {
        type,
        name,
        language,
        volumeNames: readAllText(data, 'volumeName'),
      };
  }
}

export function AddMediaForm() {
  const { addMedia } = useLanguageMediaStorage();
  const [type, setType] = useState<MediaType>('book');
  const [volumeNameCount, setVolumeNameCount] = useState(1);

  const submitMedia = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addMedia(readNewMedia(new FormData(event.currentTarget)));
    event.currentTarget.reset();
    setType('book');
    setVolumeNameCount(1);
  };

  return (
    <form onSubmit={submitMedia}>
      <label>
        Name
        <input name="name" required />
      </label>
      <label>
        Language
        <select name="language">
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {LANGUAGE_NAMES[language]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Type
        <select
          name="type"
          value={type}
          onChange={(event) => setType(event.target.value as MediaType)}
        >
          {MEDIA_TYPES.map((mediaType) => (
            <option key={mediaType} value={mediaType}>
              {MEDIA_TYPE_NAMES[mediaType]}
            </option>
          ))}
        </select>
      </label>
      {type === 'tv' && (
        <label>
          Seasons
          <input name="seasons" type="number" min="0" />
        </label>
      )}
      {type === 'manga' && (
        <label>
          Volumes
          <input name="volumes" type="number" min="0" />
        </label>
      )}
      {type === 'book' && (
        <>
          {Array.from({ length: volumeNameCount }, (_, index) => (
            <input
              key={index}
              name="volumeName"
              aria-label={`Volume ${index + 1}`}
            />
          ))}
          <button
            type="button"
            aria-label="Add another volume"
            onClick={() => setVolumeNameCount((count) => count + 1)}
          >
            <PlusIcon width="16px" />
          </button>
        </>
      )}
      <button type="submit">Add</button>
    </form>
  );
}
