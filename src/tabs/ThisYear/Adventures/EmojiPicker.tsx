import { useState } from 'react';
import { ALL_EMOJI } from './emoji';

import './EmojiPicker.css';

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const pickEmoji = (emoji: string) => {
    onChange(emoji);
    setIsOpen(false);
  };

  return (
    <div
      className="emoji-picker"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="emoji-picker-trigger"
        aria-label="Emoji"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {value}
      </button>
      {isOpen && (
        <div className="emoji-picker-grid" role="radiogroup" aria-label="Emoji">
          {ALL_EMOJI.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="radio"
              aria-checked={emoji === value}
              onClick={() => pickEmoji(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
