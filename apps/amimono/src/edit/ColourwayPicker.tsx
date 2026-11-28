import { Combobox } from 'shared/controls/combobox/Combobox';

import { RavelryColourway } from '../ravelry/types';
import { ColourwayOption, ColourwayOptionLabel } from './ColourwayOptionLabel';
import { ColourwayValueLabel } from './ColourwayValueLabel';

const TYPED_COLOURWAY_ID = 'typed';

export type ColourwayChoice = {
  name: string;
  photoUrl?: string;
};

type ColourwayPickerProps = ColourwayChoice & {
  ravelryColourways: RavelryColourway[];
  onChange: (choice: ColourwayChoice) => void;
};

export function ColourwayPicker({
  name,
  photoUrl,
  ravelryColourways,
  onChange,
}: ColourwayPickerProps) {
  const options: ColourwayOption[] = ravelryColourways.map((colourway) => ({
    id: String(colourway.id),
    label: colourway.name,
    code: colourway.code,
    photoUrl: colourway.photoUrl,
  }));
  const value = name
    ? (options.find((option) => option.label === name) ?? {
        id: TYPED_COLOURWAY_ID,
        label: name,
        photoUrl,
      })
    : undefined;

  return (
    <Combobox
      ariaLabel="Colourway"
      value={value}
      options={options}
      createOption={(label): ColourwayOption => ({
        id: TYPED_COLOURWAY_ID,
        label,
      })}
      onClear={() => onChange({ name: '' })}
      onChange={(option) =>
        onChange({ name: option.label, photoUrl: option.photoUrl })
      }
      Option={ColourwayOptionLabel}
      Value={ColourwayValueLabel}
    />
  );
}
