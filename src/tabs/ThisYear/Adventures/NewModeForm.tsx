import { useRef, useState } from 'react';
import { FormControl } from '../../../shared/controls/FormControl';
import { TickIcon } from '../../../shared/icons/Tick';
import { EmojiPicker } from './EmojiPicker';
import { findUnusedColour, MODE_COLOURS } from './modeColours';
import { AdventureMode } from './types';

type NewModeFormProps = {
  usedColours: string[];
  onSave: (mode: Omit<AdventureMode, 'id'>) => void;
};

export function NewModeForm({ usedColours, onSave }: NewModeFormProps) {
  const nameInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏃');
  const [colour, setColour] = useState(() => findUnusedColour(usedColours));

  const saveMode = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), emoji, colour });
    }
  };

  return (
    <div
      className="new-mode"
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target === nameInput.current) {
          event.preventDefault();
          saveMode();
        }
      }}
    >
      <FormControl
        ref={nameInput}
        label="Mode name"
        hideLabel
        value={name}
        onChange={setName}
      />
      <EmojiPicker value={emoji} onChange={setEmoji} />
      <div className="mode-colours" role="radiogroup" aria-label="Colour">
        {MODE_COLOURS.map((option) => (
          <input
            key={option.colour}
            type="radio"
            name="colour"
            aria-label={option.name}
            style={{ '--swatch-colour': option.colour } as React.CSSProperties}
            checked={colour === option.colour}
            onChange={() => setColour(option.colour)}
          />
        ))}
      </div>
      <button
        type="button"
        className="ghost save-mode"
        aria-label="Add mode"
        onClick={saveMode}
      >
        <TickIcon width="18px" />
      </button>
    </div>
  );
}
