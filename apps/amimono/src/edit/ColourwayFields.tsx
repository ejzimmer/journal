import { FormControl } from 'shared/controls/FormControl';

import { ColourwayDraft } from './projectDraft';

type ColourwayFieldsProps = {
  colourway: ColourwayDraft;
  onChange: (colourway: ColourwayDraft) => void;
};

export function ColourwayFields({ colourway, onChange }: ColourwayFieldsProps) {
  return (
    <div className="colourway-row">
      <FormControl
        label="Colourway"
        hideLabel
        value={colourway.name}
        onChange={(name) => onChange({ ...colourway, name })}
      />
      <FormControl
        label="Skeins"
        hideLabel
        type="number"
        min="0"
        step="0.5"
        value={colourway.skeins}
        onChange={(skeins) => onChange({ ...colourway, skeins })}
      />
      <FormControl
        label="Dye lot"
        hideLabel
        value={colourway.dyeLot}
        onChange={(dyeLot) => onChange({ ...colourway, dyeLot })}
      />
    </div>
  );
}
