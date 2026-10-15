import { KeyboardEvent, FormEvent, ReactNode } from 'react';
import { useModal } from '../../../shared/controls/Modal';
import { TickIcon } from '../../../shared/icons/Tick';
import { CountTile } from './CountTile';
import { LadyBeetleIcon } from './LadyBeetleIcon';
import { UnderstoodTile } from './UnderstoodTile';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { parseNumber } from './fields';
import { FlowerType } from './TreeFlowerIcon';
import { Comprehension, ItemPath } from './types';

import './ProgressUpdateForm.css';

type ComprehensionUpdateFormProps = {
  title: string;
  name: string;
  path: ItemPath;
  comprehension: Comprehension;
  flowerType: FlowerType;
  positionTile: ReactNode;
  onSave: (data: FormData, changes: Comprehension) => void;
};

export function ComprehensionUpdateForm({
  title,
  name,
  path,
  comprehension,
  flowerType,
  positionTile,
  onSave,
}: ComprehensionUpdateFormProps) {
  const { updateItem } = useLanguageMediaStorage();
  const { closeModal } = useModal();

  const submitOnEnter = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key === 'Enter' && event.target instanceof HTMLInputElement) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  };

  const saveProgress = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onSave(data, {
      lookups: parseNumber(data, 'lookups') ?? 0,
      aiQuestions: parseNumber(data, 'aiQuestions') ?? 0,
      understood: parseNumber(data, 'understood'),
    });
    closeModal();
  };

  return (
    <form
      className="progress-update-form"
      aria-label={`Track ${name}`}
      onKeyDown={submitOnEnter}
      onSubmit={saveProgress}
    >
      <h2 className="progress-update-title">{title}</h2>
      <div className="progress-update-body">
        <div className="progress-tiles">
          <CountTile
            name="lookups"
            label="Looked up"
            addLabel={`Add a lookup to ${name}`}
            icon={<LadyBeetleIcon colour="red" width="45px" />}
            count={comprehension.lookups}
            onAdd={() =>
              updateItem(path, { lookups: comprehension.lookups + 1 })
            }
          />
          <CountTile
            name="aiQuestions"
            label="Asked AI"
            addLabel={`Add an AI question to ${name}`}
            icon={<LadyBeetleIcon colour="yellow" width="45px" />}
            count={comprehension.aiQuestions}
            onAdd={() =>
              updateItem(path, { aiQuestions: comprehension.aiQuestions + 1 })
            }
          />
          {positionTile}
          <UnderstoodTile
            flowerType={flowerType}
            understood={comprehension.understood}
          />
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
