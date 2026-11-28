import { PlusIcon } from 'shared/icons/Plus';
import { useRavelryColourways } from '../ravelry/useRavelryColourways';
import { ColourwayFields } from './ColourwayFields';
import { YarnNamePicker } from './YarnNamePicker';
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
  const ravelryColourways = useRavelryColourways(yarn.ravelryId);
  const updateColourway = (updatedColourway: ColourwayDraft) =>
    onChange({
      ...yarn,
      colourways: yarn.colourways.map((colourway) =>
        colourway.id === updatedColourway.id ? updatedColourway : colourway,
      ),
    });

  return (
    <div className="yarn-fields">
      <YarnNamePicker
        name={yarn.name}
        ravelryId={yarn.ravelryId}
        onChange={({ name, ravelryId }) =>
          onChange({
            ...yarn,
            name,
            ravelryId,
            colourways:
              ravelryId === yarn.ravelryId
                ? yarn.colourways
                : yarn.colourways.map((colourway) => ({
                    ...colourway,
                    photoUrl: undefined,
                  })),
          })
        }
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
              ravelryColourways={yarn.ravelryId ? ravelryColourways : undefined}
              onChange={updateColourway}
            />
          ))}
        </tbody>
      </table>
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
