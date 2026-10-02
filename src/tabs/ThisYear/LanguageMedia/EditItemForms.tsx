import { ReactNode } from 'react';
import { DisclosureForm } from './DisclosureForm';
import {
  DurationField,
  NumberField,
  readDuration,
  readNumber,
  readText,
  TextField,
} from './fields';
import { LANGUAGE_NAMES } from './names';
import {
  Chapter,
  Episode,
  Language,
  LANGUAGES,
  LanguageMedia,
  Season,
  Video,
  Volume,
} from './types';

function EditItemForm({
  name,
  onSubmit,
  children,
}: {
  name: string;
  onSubmit: (data: FormData) => void;
  children: ReactNode;
}) {
  return (
    <DisclosureForm summary="Edit" label={`Edit ${name}`} onSubmit={onSubmit}>
      {children}
    </DisclosureForm>
  );
}

const readRequiredNumber = (data: FormData, name: string, fallback: number) =>
  readNumber(data, name) ?? fallback;

export function EditMediaForm<T extends LanguageMedia>({
  media,
  onChange,
}: {
  media: T;
  onChange: (media: T) => void;
}) {
  return (
    <EditItemForm
      name={media.name}
      onSubmit={(data) =>
        onChange({
          ...media,
          name: readText(data, 'name') ?? media.name,
          language: data.get('language') as Language,
        })
      }
    >
      <TextField
        label="Name"
        name="name"
        defaultValue={media.name}
        isRequired
      />
      <label>
        Language
        <select name="language" defaultValue={media.language}>
          {LANGUAGES.map((language) => (
            <option key={language} value={language}>
              {LANGUAGE_NAMES[language]}
            </option>
          ))}
        </select>
      </label>
    </EditItemForm>
  );
}

export function EditSeasonForm({
  name,
  season,
  onChange,
}: {
  name: string;
  season: Season;
  onChange: (season: Season) => void;
}) {
  return (
    <EditItemForm
      name={name}
      onSubmit={(data) =>
        onChange({
          ...season,
          number: readRequiredNumber(data, 'number', season.number),
        })
      }
    >
      <NumberField
        label="Number"
        name="number"
        defaultValue={season.number}
        isRequired
      />
    </EditItemForm>
  );
}

export function EditEpisodeForm({
  name,
  episode,
  onChange,
}: {
  name: string;
  episode: Episode;
  onChange: (episode: Episode) => void;
}) {
  return (
    <EditItemForm
      name={name}
      onSubmit={(data) =>
        onChange({
          ...episode,
          number: readRequiredNumber(data, 'number', episode.number),
          name: readText(data, 'name'),
          lengthInSeconds: readDuration(data, 'length'),
        })
      }
    >
      <NumberField
        label="Number"
        name="number"
        defaultValue={episode.number}
        isRequired
      />
      <TextField label="Name" name="name" defaultValue={episode.name} />
      <DurationField
        label="Length"
        name="length"
        defaultValue={episode.lengthInSeconds}
        durationFormat="mm:ss"
      />
    </EditItemForm>
  );
}

export function EditVideoForm({
  video,
  onChange,
}: {
  video: Video;
  onChange: (video: Video) => void;
}) {
  return (
    <EditItemForm
      name={video.url}
      onSubmit={(data) =>
        onChange({
          ...video,
          url: readText(data, 'url') ?? video.url,
          lengthInSeconds: readDuration(data, 'length'),
        })
      }
    >
      <TextField
        label="URL"
        name="url"
        type="url"
        defaultValue={video.url}
        isRequired
      />
      <DurationField
        label="Length"
        name="length"
        defaultValue={video.lengthInSeconds}
        durationFormat="hh:mm:ss"
      />
    </EditItemForm>
  );
}

export function EditVolumeForm({
  name,
  volume,
  isNameRequired,
  onChange,
}: {
  name: string;
  volume: Volume;
  isNameRequired: boolean;
  onChange: (volume: Volume) => void;
}) {
  return (
    <EditItemForm
      name={name}
      onSubmit={(data) =>
        onChange({
          ...volume,
          number: readRequiredNumber(data, 'number', volume.number),
          name: readText(data, 'name'),
          pages: readNumber(data, 'pages'),
        })
      }
    >
      <NumberField
        label="Number"
        name="number"
        defaultValue={volume.number}
        isRequired
      />
      <TextField
        label="Name"
        name="name"
        defaultValue={volume.name}
        isRequired={isNameRequired}
      />
      <NumberField label="Pages" name="pages" defaultValue={volume.pages} />
    </EditItemForm>
  );
}

export function EditChapterForm({
  name,
  chapter,
  onChange,
}: {
  name: string;
  chapter: Chapter;
  onChange: (chapter: Chapter) => void;
}) {
  return (
    <EditItemForm
      name={name}
      onSubmit={(data) =>
        onChange({
          ...chapter,
          number: readRequiredNumber(data, 'number', chapter.number),
          name: readText(data, 'name'),
          lastPage: readNumber(data, 'lastPage'),
        })
      }
    >
      <NumberField
        label="Number"
        name="number"
        defaultValue={chapter.number}
        isRequired
      />
      <TextField label="Name" name="name" defaultValue={chapter.name} />
      <NumberField
        label="Last page"
        name="lastPage"
        defaultValue={chapter.lastPage}
      />
    </EditItemForm>
  );
}
