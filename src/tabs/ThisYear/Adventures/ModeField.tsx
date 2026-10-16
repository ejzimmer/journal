import { useState } from 'react';
import { PlusIcon } from '../../../shared/icons/Plus';
import { useAdventureStorage } from './AdventureStorageContext';
import { ModeOption } from './ModeOption';
import { NewModeForm } from './NewModeForm';
import { AdventureMode } from './types';

import './ModeField.css';

type ModeFieldProps = {
  modeId?: string;
  onSelectMode: (modeId: string) => void;
};

export function ModeField({ modeId, onSelectMode }: ModeFieldProps) {
  const { modes, addMode } = useAdventureStorage();
  const [isNewModeOpen, setIsNewModeOpen] = useState(false);
  const isAddingMode = isNewModeOpen || modes.length === 0;

  const saveMode = (mode: Omit<AdventureMode, 'id'>) => {
    const newModeId = addMode(mode);
    if (newModeId) {
      onSelectMode(newModeId);
    }
    setIsNewModeOpen(false);
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
          />
        ))}
        {!isAddingMode && (
          <button
            type="button"
            className="mode-option new-mode-option"
            aria-label="New mode"
            onClick={() => setIsNewModeOpen(true)}
          >
            <PlusIcon width="14px" />
          </button>
        )}
      </div>
      {isAddingMode && (
        <NewModeForm
          usedColours={modes.map(({ colour }) => colour)}
          onSave={saveMode}
        />
      )}
    </>
  );
}
