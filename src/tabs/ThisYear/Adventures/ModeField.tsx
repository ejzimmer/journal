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

type ModeFormTarget = AdventureMode | 'new';

export function ModeField({ modeId, onSelectMode }: ModeFieldProps) {
  const { modes, addMode, updateMode } = useAdventureStorage();
  const [openFormTarget, setOpenFormTarget] = useState<ModeFormTarget>();
  const formTarget = modes.length === 0 ? 'new' : openFormTarget;
  const editingMode = formTarget === 'new' ? undefined : formTarget;

  const saveMode = (mode: Omit<AdventureMode, 'id'>) => {
    if (editingMode) {
      updateMode({ ...editingMode, ...mode });
    } else {
      const newModeId = addMode(mode);
      if (newModeId) {
        onSelectMode(newModeId);
      }
    }
    setOpenFormTarget(undefined);
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
            onEdit={() => setOpenFormTarget(mode)}
          />
        ))}
        {!formTarget && (
          <button
            type="button"
            className="mode-option new-mode-option"
            aria-label="New mode"
            onClick={() => setOpenFormTarget('new')}
          >
            <PlusIcon width="14px" />
          </button>
        )}
      </div>
      {formTarget && (
        <ModeForm
          key={editingMode?.id ?? 'new'}
          mode={editingMode}
          usedColours={modes.map(({ colour }) => colour)}
          onSave={saveMode}
        />
      )}
    </>
  );
}
