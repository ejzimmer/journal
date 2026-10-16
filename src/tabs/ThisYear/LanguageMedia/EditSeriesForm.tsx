import { FormEvent, useState } from 'react';
import { useModal } from '../../../shared/controls/Modal';
import { Switch } from '../../../shared/controls/Switch';
import { TickIcon } from '../../../shared/icons/Tick';
import { BookVolumeRow } from './BookVolumeRow';
import { parseNumber, readText } from './fields';
import { LanguageOption } from './LanguageOption';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { getItemsByNumber } from './lists';
import { MangaVolumePages } from './MangaVolumePages';
import { Language, LANGUAGES, PrintSeries } from './types';

import './ProgressUpdateForm.css';
import './AddMediaForm.css';
import './EditSeriesForm.css';

export function EditSeriesForm({ series }: { series: PrintSeries }) {
  const { updateItem } = useLanguageMediaStorage();
  const { closeModal } = useModal();
  const [language, setLanguage] = useState<Language>(series.language);
  const volumes = getItemsByNumber(series.volumes);

  const saveSeries = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateItem([series.id], {
      name: readText(data, 'name') ?? series.name,
      language,
    });
    volumes.forEach((volume) =>
      updateItem([series.id, 'volumes', volume.id], {
        ...(series.type === 'book' && {
          name: readText(data, `name-${volume.id}`),
        }),
        pages: parseNumber(data, `pages-${volume.id}`),
      }),
    );
    closeModal();
  };

  return (
    <form
      className="edit-series-form"
      aria-label={`Edit ${series.name}`}
      onSubmit={saveSeries}
    >
      <input
        className="add-media-name"
        name="name"
        aria-label="Name"
        autoComplete="off"
        defaultValue={series.name}
        required
      />
      <div className="add-media-switches">
        <Switch
          options={[...LANGUAGES]}
          value={language}
          onChange={setLanguage}
          name="language"
          Option={LanguageOption}
        />
      </div>
      {series.type === 'book' ? (
        <div className="book-volume-rows">
          {volumes.map((volume) => (
            <BookVolumeRow key={volume.id} volume={volume} />
          ))}
        </div>
      ) : (
        <div className="manga-volume-grid">
          {volumes.map((volume) => (
            <MangaVolumePages key={volume.id} volume={volume} />
          ))}
        </div>
      )}
      <button type="submit" className="progress-update-save" aria-label="Save">
        <TickIcon width="20px" strokeWidth="2.6" />
      </button>
    </form>
  );
}
