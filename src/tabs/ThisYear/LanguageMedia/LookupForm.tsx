import { KeyboardEvent, FormEvent } from 'react';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { NumberField } from './NumberField';
import { readZeroOrMore } from './fields';
import { formatVolumeName } from './format';
import { PrintSeries, Volume } from './types';

type LookupFormProps = {
  series: PrintSeries;
  volume: Volume;
  onSubmit: () => void;
};

export function LookupForm({ series, volume, onSubmit }: LookupFormProps) {
  const { updateItem } = useLanguageMediaStorage();
  const path = [series.id, 'volumes', volume.id];
  const name = formatVolumeName(volume);

  const submitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const saveComprehension = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    updateItem(path, {
      lookups: readZeroOrMore(data, 'lookups') ?? 0,
      aiQuestions: readZeroOrMore(data, 'aiQuestions') ?? 0,
      understood: readZeroOrMore(data, 'understood'),
    });
    onSubmit();
  };

  return (
    <form
      aria-label={`Track ${name}`}
      onKeyDown={submitOnEnter}
      onSubmit={saveComprehension}
    >
      <button
        type="button"
        aria-label={`Add a lookup to ${name}`}
        onClick={() => updateItem(path, { lookups: volume.lookups + 1 })}
      >
        +1 looked up
      </button>
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
