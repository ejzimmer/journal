import { PROJECT_TYPES } from '../projects/projectTypes';
import { ProjectType } from '../projects/types';

type TypeOptionLabelProps = {
  type: ProjectType;
};

export function TypeOptionLabel({ type }: TypeOptionLabelProps) {
  const { icon, label } = PROJECT_TYPES[type];

  return (
    <>
      <img src={icon} alt="" width="20" height="20" />
      {label}
    </>
  );
}
