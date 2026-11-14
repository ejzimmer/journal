import { ReactNode } from 'react';
import { Colour } from './types';

export type LabelOption = {
  id: string;
  label: string;
  colour: Colour;
};

type LabelOptionTagProps = {
  value: LabelOption;
  children?: ReactNode;
};

export function LabelOptionTag({ value, children }: LabelOptionTagProps) {
  return (
    <div className={`label-tag ${value.colour}`}>
      {value.label} {children}
    </div>
  );
}
