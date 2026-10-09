import { KeyboardEvent, FormEvent } from 'react';
import { useModal } from '../../../shared/controls/Modal';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { NumberField } from './NumberField';
import { parseNumber } from './fields';
import { formatVolumeName, formatVolumeTitle } from './format';
import { PrintSeries, Volume } from './types';

import './ProgressUpdateForm.css';

type ProgressUpdateFormProps = {
  series: PrintSeries;
  volume: Volume;
};

export function ProgressUpdateForm({
  series,
  volume,
}: ProgressUpdateFormProps) {
  const { updateItem } = useLanguageMediaStorage();
  const { closeModal } = useModal();
  const path = [series.id, 'volumes', volume.id];
  const name = formatVolumeName(volume);

  const submitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const pageUpTo =
    series.upTo?.volume === volume.number ? series.upTo.page : undefined;

  const saveProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const page = parseNumber(data, 'page');
    if (page !== undefined) {
      updateItem([series.id], { upTo: { volume: volume.number, page } });
    }
    updateItem(path, {
      lookups: parseNumber(data, 'lookups') ?? 0,
      aiQuestions: parseNumber(data, 'aiQuestions') ?? 0,
      understood: parseNumber(data, 'understood'),
    });
    closeModal();
  };

  return (
    <form
      aria-label={`Track ${name}`}
      onKeyDown={submitOnEnter}
      onSubmit={saveProgress}
    >
      <h2 className="progress-update-title">
        {formatVolumeTitle(series, volume)}
      </h2>
      <button
        type="button"
        aria-label={`Add a lookup to ${name}`}
        onClick={() => updateItem(path, { lookups: volume.lookups + 1 })}
      >
        +1 looked up
      </button>
      <NumberField
        label="Page"
        name="page"
        defaultValue={pageUpTo}
        min={0}
        max={volume.pages}
      />
      <NumberField
        key={volume.lookups}
        label="Looked up"
        name="lookups"
        defaultValue={volume.lookups}
        min={0}
      />
      <NumberField
        label="Asked AI"
        name="aiQuestions"
        defaultValue={volume.aiQuestions}
        min={0}
      />
      <NumberField
        label="Understood (%)"
        name="understood"
        defaultValue={volume.understood}
        min={0}
        max={100}
      />
    </form>
  );
}
