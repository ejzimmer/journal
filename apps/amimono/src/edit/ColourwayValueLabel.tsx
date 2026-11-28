import { ColourwayOption } from './ColourwayOptionLabel';

type ColourwayValueLabelProps = {
  value: ColourwayOption;
};

export function ColourwayValueLabel({ value }: ColourwayValueLabelProps) {
  return (
    <span className="colourway-option">
      {value.photoUrl && (
        <img src={value.photoUrl} alt="" width="20" height="20" />
      )}
      <span className="colourway-option-name">{value.label}</span>
    </span>
  );
}
