import { useState } from 'react';
import { FormControl } from '../../../shared/controls/FormControl';
import { PlusIcon } from '../../../shared/icons/Plus';
import { useAdventureStorage } from './AdventureStorageContext';
import { EmojiPicker } from './EmojiPicker';
import { findUnusedColour, MODE_COLOURS } from './modeColours';
import { AdventureMode } from './types';

import './ModeField.css';

const NEW_MODE = 'new';
const DEFAULT_EMOJI = '🏃';

type NewMode = Omit<AdventureMode, 'id'>;

type ModeFieldProps = {
  modes: AdventureMode[];
  modeId: string;
  onSelectMode: (modeId: string) => void;
  newMode: NewMode;
  onChangeNewMode: (newMode: NewMode) => void;
};

export function useModeField() {
  const { modes, addMode } = useAdventureStorage();
  const [selectedModeId, setSelectedModeId] = useState<string>();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState(DEFAULT_EMOJI);
  const [selectedColour, setSelectedColour] = useState<string>();

  const modeId = selectedModeId ?? modes[0]?.id ?? NEW_MODE;
  const colour =
    selectedColour ?? findUnusedColour(modes.map(({ colour }) => colour));
  const newMode = { name, emoji, colour };

  const updateNewMode = (mode: NewMode) => {
    setName(mode.name);
    setEmoji(mode.emoji);
    setSelectedColour(mode.colour);
  };

  const saveMode = () => {
    if (modeId !== NEW_MODE) {
      return modeId;
    }
    if (!name.trim()) {
      return null;
    }
    return addMode({ ...newMode, name: name.trim() });
  };

  const modeFieldProps: ModeFieldProps = {
    modes,
    modeId,
    onSelectMode: setSelectedModeId,
    newMode,
    onChangeNewMode: updateNewMode,
  };

  return { modeFieldProps, saveMode };
}

export function ModeField({
  modes,
  modeId,
  onSelectMode,
  newMode,
  onChangeNewMode,
}: ModeFieldProps) {
  return (
    <>
      <div className="mode-options" role="radiogroup" aria-label="Mode">
        {modes.map((mode) => (
          <label
            key={mode.id}
            className="mode-option"
            style={{ '--mode-colour': mode.colour } as React.CSSProperties}
          >
            <input
              type="radio"
              name="mode"
              checked={modeId === mode.id}
              onChange={() => onSelectMode(mode.id)}
            />
            <span aria-hidden="true">{mode.emoji}</span>
            {mode.name}
          </label>
        ))}
        {modeId !== NEW_MODE && (
          <label className="mode-option new-mode-option" aria-label="New mode">
            <input
              type="radio"
              name="mode"
              onChange={() => onSelectMode(NEW_MODE)}
            />
            <PlusIcon width="14px" />
          </label>
        )}
      </div>
      {modeId === NEW_MODE && (
        <div className="new-mode">
          <FormControl
            label="Mode name"
            hideLabel
            value={newMode.name}
            onChange={(name) => onChangeNewMode({ ...newMode, name })}
          />
          <EmojiPicker
            value={newMode.emoji}
            onChange={(emoji) => onChangeNewMode({ ...newMode, emoji })}
          />
          <div className="mode-colours" role="radiogroup" aria-label="Colour">
            {MODE_COLOURS.map(({ name, colour }) => (
              <input
                key={colour}
                type="radio"
                name="colour"
                aria-label={name}
                style={{ '--swatch-colour': colour } as React.CSSProperties}
                checked={newMode.colour === colour}
                onChange={() => onChangeNewMode({ ...newMode, colour })}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
