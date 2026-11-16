import { PROJECT_TYPES } from '../projects/projectTypes';
import { ProjectType } from '../projects/types';

export type TypeOption = { id: ProjectType; label: string };

type TypeOptionLabelProps = {
  value: TypeOption;
};

export function TypeOptionLabel({ value }: TypeOptionLabelProps) {
  return (
    <span className="type-option">
      <img src={PROJECT_TYPES[value.id].icon} alt="" width="20" height="20" />
      {value.label}
    </span>
  );
}
