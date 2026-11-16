import { ColourwayDraft } from './projectDraft';

type ColourwayFieldsProps = {
  colourway: ColourwayDraft;
  onChange: (colourway: ColourwayDraft) => void;
};

export function ColourwayFields({ colourway, onChange }: ColourwayFieldsProps) {
  return (
    <tr>
      <td>
        <input
          aria-label="Colourway"
          value={colourway.name}
          onChange={(event) =>
            onChange({ ...colourway, name: event.target.value })
          }
        />
      </td>
      <td>
        <input
          aria-label="Skeins"
          type="number"
          min="0"
          step="0.5"
          value={colourway.skeins}
          onChange={(event) =>
            onChange({ ...colourway, skeins: event.target.value })
          }
        />
      </td>
      <td>
        <input
          aria-label="Dye lot"
          value={colourway.dyeLot}
          onChange={(event) =>
            onChange({ ...colourway, dyeLot: event.target.value })
          }
        />
      </td>
    </tr>
  );
}
