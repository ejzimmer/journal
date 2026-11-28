import './ColourwayOptionLabel.css';

export type ColourwayOption = {
  id: string;
  label: string;
  code?: string;
  photoUrl?: string;
};

type ColourwayOptionLabelProps = {
  value: ColourwayOption;
};

export function ColourwayOptionLabel({ value }: ColourwayOptionLabelProps) {
  return (
    <span className="colourway-option">
      {value.photoUrl && (
        <img src={value.photoUrl} alt="" width="24" height="24" />
      )}
      <span className="colourway-option-name">{value.label}</span>
      {value.code && <span className="colourway-code">{value.code}</span>}
    </span>
  );
}
