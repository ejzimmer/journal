import { useState } from 'react';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { LANGUAGE_NAMES, MEDIA_TYPE_NAMES } from './names';
import { Language, LANGUAGES, MEDIA_TYPES, MediaType, NewMedia } from './types';

const readCount = (data: FormData, name: string) =>
  Number(data.get(name)) || undefined;

const readLines = (data: FormData, name: string) =>
  String(data.get(name) ?? '')
    .split('\n')
    .map((line) => line.trim())
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
        volumeNames: readLines(data, 'volumeNames'),
      };
  }
}

export function AddMediaForm() {
  const { addMedia } = useLanguageMediaStorage();
  const [type, setType] = useState<MediaType>('book');

  const submitMedia = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    addMedia(readNewMedia(new FormData(event.currentTarget)));
    event.currentTarget.reset();
    setType('book');
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
        <label>
          Volume titles
          <textarea name="volumeNames" />
        </label>
      )}
      <button type="submit">Add</button>
    </form>
  );
}
