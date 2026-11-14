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
      <input
        aria-label="Yarn name"
        value={yarn.name}
        onChange={(event) => onChange({ ...yarn, name: event.target.value })}
      />
      <div className="colourway-grid colourway-headings" aria-hidden="true">
        <span>Colourway</span>
        <span>Skeins</span>
        <span>Dye lot</span>
      </div>
      {yarn.colourways.map((colourway) => (
        <ColourwayFields
          key={colourway.id}
          colourway={colourway}
          onChange={updateColourway}
        />
      ))}
      <button
        type="button"
        className="add-button"
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
