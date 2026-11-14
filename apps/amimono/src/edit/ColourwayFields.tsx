import { ColourwayDraft } from './projectDraft';

type ColourwayFieldsProps = {
  colourway: ColourwayDraft;
  onChange: (colourway: ColourwayDraft) => void;
};

export function ColourwayFields({ colourway, onChange }: ColourwayFieldsProps) {
  return (
    <div className="colourway-grid">
      <input
        aria-label="Colourway"
        value={colourway.name}
        onChange={(event) =>
          onChange({ ...colourway, name: event.target.value })
        }
      />
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
      <input
        aria-label="Dye lot"
        value={colourway.dyeLot}
        onChange={(event) =>
          onChange({ ...colourway, dyeLot: event.target.value })
        }
      />
    </div>
  );
}
