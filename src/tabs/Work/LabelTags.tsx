import { XIcon } from '../../shared/icons/X';
import { LabelColourPicker } from './Task/LabelColourPicker';
import { Colour } from './types';

export type LabelTag = {
  id: string;
  value: string;
  colour: Colour;
};

type LabelTagsProps = {
  labels: LabelTag[];
  onRemoveLabel: (id: string) => void;
  onChangeColour: (id: string, colour: Colour) => void;
  onEditLabel?: (id: string) => void;
};

export function LabelTags({
  labels,
  onRemoveLabel,
  onChangeColour,
  onEditLabel,
}: LabelTagsProps) {
  if (labels.length === 0) {
    return null;
  }

  return (
    <ul className="labels">
      {labels.map(({ id, value, colour }) => (
        <li key={id} className={`label-tag ${colour}`}>
          {onEditLabel ? (
            <button
              type="button"
              className="label-value"
              aria-label={`Change ${value} label`}
              onClick={() => onEditLabel(id)}
            >
              {value}
            </button>
          ) : (
            value
          )}
          <LabelColourPicker
            label={value}
            colour={colour}
            onChange={(colour) => onChangeColour(id, colour)}
          />
          <button
            type="button"
            className="ghost transient"
            aria-label={`Remove ${value}`}
            onClick={() => onRemoveLabel(id)}
          >
            <XIcon width="16px" />
          </button>
        </li>
      ))}
    </ul>
  );
}
