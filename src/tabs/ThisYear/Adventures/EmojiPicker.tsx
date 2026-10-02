import { useState } from 'react';
import Picker, { EmojiStyle } from 'emoji-picker-react';

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
        <div className="emoji-picker-popover">
          <Picker
            emojiStyle={EmojiStyle.NATIVE}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
            autoFocusSearch
            height={360}
            onEmojiClick={({ emoji }) => pickEmoji(emoji)}
          />
        </div>
      )}
    </div>
  );
}
