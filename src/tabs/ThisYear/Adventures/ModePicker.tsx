import { FocusEvent, KeyboardEvent, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useAdventureStorage } from './AdventureStorageContext';
import { AdventureMode } from './types';

import './ModePicker.css';

type ModePickerProps = {
  mode: AdventureMode;
  onChange: (modeId: string) => void;
};

export function ModePicker({ mode, onChange }: ModePickerProps) {
  const { modes } = useAdventureStorage();
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closePicker = () => {
    flushSync(() => setIsOpen(false));
    triggerRef.current?.focus();
  };

  const selectMode = (modeId: string) => {
    if (modeId !== mode.id) {
      onChange(modeId);
    }
    closePicker();
  };

  const closePickerOnEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      closePicker();
    }
  };

  const closePickerOnFocusOut = (event: FocusEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <span
      className="mode-picker"
      onKeyDown={closePickerOnEscape}
      onBlur={closePickerOnFocusOut}
    >
      <button
        ref={triggerRef}
        type="button"
        className="mode-emoji"
        aria-label={mode.name}
        aria-expanded={isOpen}
        onClick={() => (isOpen ? closePicker() : setIsOpen(true))}
      >
        {mode.emoji}
      </button>
      {isOpen && (
        <span className="mode-choices" role="group" aria-label="Mode">
          {modes.map((choice) => (
            <button
              key={choice.id}
              type="button"
              className="mode-choice"
              aria-label={choice.name}
              aria-pressed={choice.id === mode.id}
              autoFocus={choice.id === mode.id}
              style={
                { '--choice-colour': choice.colour } as React.CSSProperties
              }
              onClick={() => selectMode(choice.id)}
            >
              {choice.emoji}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}
