import { Combobox } from 'shared/controls/combobox/Combobox';

import { RavelryColourway } from '../ravelry/types';
import { ColourwayOption, ColourwayOptionLabel } from './ColourwayOptionLabel';
import { ColourwayValueLabel } from './ColourwayValueLabel';

import './ColourwayPicker.css';

const TYPED_COLOURWAY_ID = 'typed';

type ColourwayPickerProps = {
  name: string;
  ravelryColourways: RavelryColourway[];
  onChange: (name: string) => void;
};

export function ColourwayPicker({
  name,
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
      })
    : undefined;

  return (
    <div className="colourway-picker">
      <Combobox
        ariaLabel="Colourway"
        value={value}
        options={options}
        createOption={(label) => ({ id: TYPED_COLOURWAY_ID, label })}
        onSearch={(searchTerm) => {
          if (!searchTerm.trim()) onChange('');
        }}
        onChange={(option) => onChange(option.label)}
        Option={ColourwayOptionLabel}
        Value={ColourwayValueLabel}
      />
    </div>
  );
}
