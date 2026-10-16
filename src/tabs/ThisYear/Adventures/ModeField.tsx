import { useState } from 'react';
import { PlusIcon } from '../../../shared/icons/Plus';
import { useAdventureStorage } from './AdventureStorageContext';
import { ModeForm } from './ModeForm';
import { ModeOption } from './ModeOption';
import { AdventureMode } from './types';

import './ModeField.css';

type ModeFieldProps = {
  modeId?: string;
  onSelectMode: (modeId: string) => void;
};

export function ModeField({ modeId, onSelectMode }: ModeFieldProps) {
  const { adventures, modes, addMode, updateMode, deleteMode } =
    useAdventureStorage();
  const [modeForm, setModeForm] = useState<{ mode?: AdventureMode }>();
  const openModeForm = modes.length === 0 ? {} : modeForm;

  const saveMode = (mode: Omit<AdventureMode, 'id'>) => {
    if (openModeForm?.mode) {
      updateMode({ ...openModeForm.mode, ...mode });
    } else {
      const newModeId = addMode(mode);
      if (newModeId) {
        onSelectMode(newModeId);
      }
    }
    setModeForm(undefined);
  };

  const isModeInUse = (mode: AdventureMode) =>
    adventures.some(({ modeId }) => modeId === mode.id);

  const removeMode = (mode: AdventureMode) => {
    deleteMode(mode);
    const otherMode = modes.find(({ id }) => id !== mode.id);
    if (mode.id === modeId && otherMode) {
      onSelectMode(otherMode.id);
    }
    if (openModeForm?.mode?.id === mode.id) {
      setModeForm(undefined);
    }
  };

  return (
    <>
      <div className="mode-options" role="radiogroup" aria-label="Mode">
        {modes.map((mode) => (
          <ModeOption
            key={mode.id}
            mode={mode}
            isSelected={modeId === mode.id}
            onSelect={() => onSelectMode(mode.id)}
            onEdit={() => setModeForm({ mode })}
            onDelete={isModeInUse(mode) ? undefined : () => removeMode(mode)}
          />
        ))}
        {!openModeForm && (
          <button
            type="button"
            className="mode-option new-mode-option"
            aria-label="New mode"
            onClick={() => setModeForm({})}
          >
            <PlusIcon width="14px" />
          </button>
        )}
      </div>
      {openModeForm && (
        <ModeForm
          key={openModeForm.mode?.id ?? 'new'}
          mode={openModeForm.mode}
          usedColours={modes.map(({ colour }) => colour)}
          onSave={saveMode}
        />
      )}
    </>
  );
}
