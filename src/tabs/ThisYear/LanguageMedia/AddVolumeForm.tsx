import { FormEvent, useState } from 'react';
import { PlusIcon } from '../../../shared/icons/Plus';
import { readNumber, readText } from './fields';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { findNextNumber, NO_COMPREHENSION } from './newItems';
import { NumberField } from './NumberField';
import { TextField } from './TextField';
import { PrintSeries } from './types';

export function AddVolumeForm({ series }: { series: PrintSeries }) {
  const { addItem } = useLanguageMediaStorage();
  const [isOpen, setIsOpen] = useState(false);

  const addVolume = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    addItem([series.id, 'volumes'], {
      number: findNextNumber(series.volumes),
      name: readText(data, 'name'),
      pages: readNumber(data, 'pages'),
      ...NO_COMPREHENSION,
    });
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="add-volume"
        aria-label={`Add a volume to ${series.name}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((wasOpen) => !wasOpen)}
      >
        <PlusIcon width="16px" />
      </button>
      {isOpen && (
        <form aria-label="Add volume" onSubmit={addVolume}>
          {series.type === 'book' && (
            <TextField label="Name" name="name" isRequired />
          )}
          <NumberField label="Pages" name="pages" isRequired />
          <button type="submit">Add volume</button>
        </form>
      )}
    </>
  );
}
