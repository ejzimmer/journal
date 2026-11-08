import { DoneTick } from './DoneTick';
import { TooltipTriggerProps } from './Tooltip';
import './EmojiCheckbox.css';

type EmojiCheckboxProps = {
  emoji: string | React.ReactElement;
  isChecked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  useTickForDone?: boolean;
  tooltipTriggerProps?: TooltipTriggerProps;
};

export function EmojiCheckbox({
  emoji,
  isChecked,
  onChange,
  label,
  useTickForDone,
  tooltipTriggerProps,
}: EmojiCheckboxProps) {
  const checkedClass = isChecked ? (useTickForDone ? 'done-icon' : 'done') : '';

  return (
    <label
      {...tooltipTriggerProps}
      className={`emoji-checkbox ${checkedClass}`}
    >
      <input
        aria-label={label}
        type="checkbox"
        onChange={onChange}
        checked={isChecked}
      />
      {isChecked && useTickForDone ? (
        <DoneTick />
      ) : typeof emoji === 'string' ? (
        emoji.startsWith('.') ? (
          <img
            src={emoji}
            alt=""
            style={{
              verticalAlign: 'bottom',
              maxWidth: '24px',
              maxHeight: '24px',
            }}
          />
        ) : (
          <div>{emoji}</div>
        )
      ) : (
        emoji
      )}
    </label>
  );
}
