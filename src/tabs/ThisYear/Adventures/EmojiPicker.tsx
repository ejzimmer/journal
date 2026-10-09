import { useState } from 'react';
import Picker, { EmojiStyle } from 'emoji-picker-react';

import './EmojiPicker.css';

const PICKER_HEIGHT = 360;
const COMFORTABLE_PICKER_HEIGHT = 240;
const POPOVER_GAP = 6;
const VIEWPORT_MARGIN = 16;

type PickerLayout = { height: number; isAbove: boolean };

const calculatePickerLayout = (trigger: HTMLElement): PickerLayout => {
  const { top, bottom } = trigger.getBoundingClientRect();
  const spaceAbove = top - POPOVER_GAP - VIEWPORT_MARGIN;
  const spaceBelow =
    window.innerHeight - bottom - POPOVER_GAP - VIEWPORT_MARGIN;
  const isAbove =
    spaceBelow < COMFORTABLE_PICKER_HEIGHT && spaceAbove > spaceBelow;

  return {
    height: Math.min(PICKER_HEIGHT, isAbove ? spaceAbove : spaceBelow),
    isAbove,
  };
};

export function EmojiPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (emoji: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [layout, setLayout] = useState<PickerLayout>({
    height: PICKER_HEIGHT,
    isAbove: false,
  });

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
        onClick={(event) => {
          if (!isOpen) {
            setLayout(calculatePickerLayout(event.currentTarget));
          }
          setIsOpen(!isOpen);
        }}
      >
        {value}
      </button>
      {isOpen && (
        <div
          className={`emoji-picker-popover${layout.isAbove ? ' above' : ''}`}
        >
          <Picker
            emojiStyle={EmojiStyle.NATIVE}
            previewConfig={{ showPreview: false }}
            skinTonesDisabled
            autoFocusSearch
            height={layout.height}
            onEmojiClick={({ emoji }) => pickEmoji(emoji)}
          />
        </div>
      )}
    </div>
  );
}
