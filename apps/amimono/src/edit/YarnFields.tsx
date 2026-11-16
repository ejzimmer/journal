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
      <table className="colourway-table">
        <thead>
          <tr>
            <th>Colourway</th>
            <th>Skeins</th>
            <th>Dye lot</th>
          </tr>
        </thead>
        <tbody>
          {yarn.colourways.map((colourway) => (
            <ColourwayFields
              key={colourway.id}
              colourway={colourway}
              onChange={updateColourway}
            />
          ))}
        </tbody>
      </table>
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
