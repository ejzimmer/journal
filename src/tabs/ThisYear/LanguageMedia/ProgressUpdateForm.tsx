import { KeyboardEvent, FormEvent, useState } from 'react';
import { useModal } from '../../../shared/controls/Modal';
import { TickIcon } from '../../../shared/icons/Tick';
import { CountTile } from './CountTile';
import { LadyBeetleIcon } from './LadyBeetleIcon';
import { PageTile } from './PageTile';
import { UnderstoodTile } from './UnderstoodTile';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { parseNumber } from './fields';
import { formatVolumeName, formatVolumeTitle } from './format';
import { PrintSeries, Reading, Volume } from './types';

import './ProgressUpdateForm.css';

type ProgressUpdateFormProps = {
  series: PrintSeries;
  volume: Volume;
};

export function ProgressUpdateForm({
  series,
  volume,
}: ProgressUpdateFormProps) {
  const { addItem, updateItem } = useLanguageMediaStorage();
  const { closeModal } = useModal();
  const [readingId, setReadingId] = useState<string | null>(null);
  const readingsPath = [series.id, 'volumes', volume.id, 'readings'];
  const reading = readingId ? volume.readings?.[readingId] : undefined;
  const name = formatVolumeName(volume);

  const submitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const pageUpTo =
    series.upTo?.volume === volume.number ? series.upTo.page : undefined;

  const saveReading = (changes: Partial<Reading>) => {
    if (readingId) {
      updateItem([...readingsPath, readingId], changes);
    } else {
      setReadingId(
        addItem(readingsPath, {
          lookups: 0,
          aiQuestions: 0,
          page: pageUpTo,
          ...changes,
        }),
      );
    }
  };

  const saveProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const page = parseNumber(data, 'page');
    if (page !== undefined) {
      updateItem([series.id], { upTo: { volume: volume.number, page } });
    }
    const changes = {
      lookups: parseNumber(data, 'lookups') ?? 0,
      aiQuestions: parseNumber(data, 'aiQuestions') ?? 0,
      understood: parseNumber(data, 'understood'),
    };
    const hasProgress =
      changes.lookups > 0 ||
      changes.aiQuestions > 0 ||
      changes.understood !== undefined ||
      (page !== undefined && page !== pageUpTo);
    if (readingId || hasProgress) {
      saveReading({ ...changes, page: page ?? pageUpTo });
    }
    closeModal();
  };

  return (
    <form
      className="progress-update-form"
      aria-label={`Track ${name}`}
      onKeyDown={submitOnEnter}
      onSubmit={saveProgress}
    >
      <h2 className="progress-update-title">
        {formatVolumeTitle(series, volume)}
      </h2>
      <div className="progress-update-body">
        <div className="progress-tiles">
          <CountTile
            name="lookups"
            label="Looked up"
            addLabel={`Add a lookup to ${name}`}
            icon={<LadyBeetleIcon colour="red" width="45px" />}
            count={reading?.lookups ?? 0}
            onAdd={() => saveReading({ lookups: (reading?.lookups ?? 0) + 1 })}
          />
          <CountTile
            name="aiQuestions"
            label="Asked AI"
            addLabel={`Add an AI question to ${name}`}
            icon={<LadyBeetleIcon colour="yellow" width="45px" />}
            count={reading?.aiQuestions ?? 0}
            onAdd={() =>
              saveReading({ aiQuestions: (reading?.aiQuestions ?? 0) + 1 })
            }
          />
          <PageTile page={pageUpTo} pages={volume.pages} />
          <UnderstoodTile seriesType={series.type} />
        </div>
        <button
          type="submit"
          className="progress-update-save"
          aria-label="Save"
        >
          <TickIcon width="20px" strokeWidth="2.6" />
        </button>
      </div>
    </form>
  );
}
