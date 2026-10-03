import { useState } from 'react';
import { PlusIcon } from '../../../shared/icons/Plus';
import { AddVolumeForm } from './AddVolumeForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { PrintSeries } from './types';

export function GardenVolumeAdder({ series }: { series: PrintSeries }) {
  const { addItem } = useLanguageMediaStorage();
  const [isOpen, setIsOpen] = useState(false);

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
        <AddVolumeForm
          volumes={series.volumes}
          isNameRequired={series.type === 'book'}
          onAdd={(volume) => {
            addItem([series.id, 'volumes'], volume);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
