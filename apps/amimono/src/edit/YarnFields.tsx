import { FormControl } from 'shared/controls/FormControl';
import { PlusIcon } from 'shared/icons/Plus';
import { ColourwayFields } from './ColourwayFields';
import {
  ColourwayDraft,
  createColourwayDraft,
  YarnDraft,
} from './projectDraft';

type YarnFieldsProps = {
  yarn: YarnDraft;
  onChange: (yarn: YarnDraft) => void;
};

export function YarnFields({ yarn, onChange }: YarnFieldsProps) {
  const updateColourway = (updatedColourway: ColourwayDraft) =>
    onChange({
      ...yarn,
      colourways: yarn.colourways.map((colourway) =>
        colourway.id === updatedColourway.id ? updatedColourway : colourway,
      ),
    });

  return (
    <div className="yarn-fields">
      <FormControl
        label="Yarn name"
        hideLabel
        value={yarn.name}
        onChange={(name) => onChange({ ...yarn, name })}
      />
      <div className="colourway-fields">
        {yarn.colourways.map((colourway) => (
          <ColourwayFields
            key={colourway.id}
            colourway={colourway}
            onChange={updateColourway}
          />
        ))}
      </div>
      <button
        type="button"
        className="round-button add-button"
        aria-label="Add colourway"
        title="Add colourway"
        onClick={() =>
          onChange({
            ...yarn,
            colourways: [...yarn.colourways, createColourwayDraft()],
          })
        }
      >
        <PlusIcon width="18" />
      </button>
    </div>
  );
}
