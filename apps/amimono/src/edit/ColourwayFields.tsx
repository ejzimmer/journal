import { FormControl } from 'shared/controls/FormControl';

import { RavelryColourway } from '../ravelry/types';
import { ColourwayPicker } from './ColourwayPicker';
import { ColourwayDraft } from './projectDraft';

type ColourwayFieldsProps = {
  colourway: ColourwayDraft;
  ravelryColourways?: RavelryColourway[];
  onChange: (colourway: ColourwayDraft) => void;
};

export function ColourwayFields({
  colourway,
  ravelryColourways,
  onChange,
}: ColourwayFieldsProps) {
  return (
    <tr>
      <td>
        {ravelryColourways ? (
          <ColourwayPicker
            name={colourway.name}
            photoUrl={colourway.photoUrl}
            ravelryColourways={ravelryColourways}
            onChange={({ name, photoUrl }) =>
              onChange({ ...colourway, name, photoUrl })
            }
          />
        ) : (
          <FormControl
            label="Colourway"
            hideLabel
            value={colourway.name}
            onChange={(name) =>
              onChange({ ...colourway, name, photoUrl: undefined })
            }
          />
        )}
      </td>
      <td>
        <FormControl
          label="Skeins"
          hideLabel
          type="number"
          min="0"
          step="0.5"
          value={colourway.skeins}
          onChange={(skeins) => onChange({ ...colourway, skeins })}
        />
      </td>
      <td>
        <FormControl
          label="Dye lot"
          hideLabel
          value={colourway.dyeLot}
          onChange={(dyeLot) => onChange({ ...colourway, dyeLot })}
        />
      </td>
    </tr>
  );
}
