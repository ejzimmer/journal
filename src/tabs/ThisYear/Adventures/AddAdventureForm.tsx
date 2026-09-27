import { useState } from 'react';
import { FormControl } from '../../../shared/controls/FormControl';
import { Modal, useModal } from '../../../shared/controls/Modal';
import { PlusIcon } from '../../../shared/icons/Plus';
import { TickIcon } from '../../../shared/icons/Tick';
import { useAdventureStorage } from './AdventureStorageContext';
import { EmojiPicker } from './EmojiPicker';
import { findUnusedLineColour, LINE_COLOURS } from './lineColours';
import { PushpinButton } from './PushpinButton';

import './AddAdventureForm.css';

const NEW_MODE = 'new';
const DEFAULT_EMOJI = '🏃';

export function AddAdventureForm() {
  const [formKey, setFormKey] = useState(0);

  return (
    <Modal trigger={PushpinButton} onClose={() => setFormKey((key) => key + 1)}>
      <AdventureFields key={formKey} />
    </Modal>
  );
}

function AdventureFields() {
  const { modes, addAdventure, addMode } = useAdventureStorage();
  const { closeModal } = useModal();
  const [description, setDescription] = useState('');
  const [selectedModeId, setSelectedModeId] = useState<string>();
  const [modeName, setModeName] = useState('');
  const [modeEmoji, setModeEmoji] = useState(DEFAULT_EMOJI);
  const [selectedColour, setSelectedColour] = useState<string>();

  const modeId = selectedModeId ?? modes[0]?.id ?? NEW_MODE;
  const modeColour =
    selectedColour ?? findUnusedLineColour(modes.map(({ colour }) => colour));

  const saveMode = () =>
    modeId === NEW_MODE
      ? modeName.trim() &&
        addMode({ name: modeName.trim(), emoji: modeEmoji, colour: modeColour })
      : modeId;

  const saveAdventure = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim()) {
      return;
    }

    const savedModeId = saveMode();
    if (!savedModeId) {
      return;
    }

    addAdventure({ description: description.trim(), modeId: savedModeId });
    closeModal();
  };

  return (
    <form className="add-adventure-form" onSubmit={saveAdventure}>
      <FormControl
        label="Adventure"
        hideLabel
        value={description}
        onChange={setDescription}
      />
      <div className="modes" role="radiogroup" aria-label="Mode">
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
              onChange={() => setSelectedModeId(mode.id)}
            />
            <span aria-hidden="true">{mode.emoji}</span>
            {mode.name}
          </label>
        ))}
        <label className="mode-option new-mode-option" aria-label="New mode">
          <input
            type="radio"
            name="mode"
            checked={modeId === NEW_MODE}
            onChange={() => setSelectedModeId(NEW_MODE)}
          />
          <PlusIcon width="14px" />
        </label>
      </div>
      {modeId === NEW_MODE && (
        <div className="new-mode">
          <FormControl
            label="Mode name"
            hideLabel
            value={modeName}
            onChange={setModeName}
          />
          <div className="new-mode-look">
            <EmojiPicker value={modeEmoji} onChange={setModeEmoji} />
            <div className="swatches" role="radiogroup" aria-label="Colour">
              {LINE_COLOURS.map(({ name, colour }) => (
                <input
                  key={colour}
                  type="radio"
                  name="colour"
                  className="swatch"
                  aria-label={name}
                  style={{ '--swatch-colour': colour } as React.CSSProperties}
                  checked={modeColour === colour}
                  onChange={() => setSelectedColour(colour)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="footer">
        <button type="submit" className="ghost submit" aria-label="Add">
          <TickIcon width="20px" />
        </button>
      </div>
    </form>
  );
}
