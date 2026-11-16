import { BallOfYarnIcon } from 'shared/icons/BallOfYarn';

import { YARN_TYPE_IDS, YarnTypeId } from './types';
import { YARN_COLOURS } from './utils';

type YarnTypeOption = { id: YarnTypeId; label: string };

export const YARN_TYPE_OPTIONS: YarnTypeOption[] = YARN_TYPE_IDS.map((id) => ({
  id,
  label: id,
}));

type YarnTypeLabelProps = {
  value: YarnTypeOption;
};

export function YarnTypeLabel({ value }: YarnTypeLabelProps) {
  return (
    <span className="yarn-type-option">
      <BallOfYarnIcon width="20px" colour={YARN_COLOURS[value.id]} />
      {value.label}
    </span>
  );
}
