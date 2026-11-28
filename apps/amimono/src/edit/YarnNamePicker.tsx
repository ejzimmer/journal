import { Combobox } from 'shared/controls/combobox/Combobox';

import { useRavelryYarnSearch } from '../ravelry/useRavelryYarnSearch';

const TYPED_YARN_ID = 'typed';

export type YarnName = {
  name: string;
  ravelryId?: number;
};

type YarnOption = {
  id: string;
  label: string;
  ravelryId?: number;
};

type YarnNamePickerProps = YarnName & {
  onChange: (yarnName: YarnName) => void;
};

export function YarnNamePicker({
  name,
  ravelryId,
  onChange,
}: YarnNamePickerProps) {
  const { yarns, searchYarns } = useRavelryYarnSearch();
  const options: YarnOption[] = yarns.map((yarn) => ({
    id: String(yarn.id),
    label: yarn.name,
    ravelryId: yarn.id,
  }));
  const value: YarnOption | undefined = name
    ? {
        id: ravelryId ? String(ravelryId) : TYPED_YARN_ID,
        label: name,
        ravelryId,
      }
    : undefined;

  return (
    <Combobox
      ariaLabel="Yarn name"
      value={value}
      options={options}
      onSearch={searchYarns}
      onClear={() => onChange({ name: '' })}
      filterOptions={false}
      createOption={(label): YarnOption => ({ id: TYPED_YARN_ID, label })}
      onChange={(option) =>
        onChange({ name: option.label, ravelryId: option.ravelryId })
      }
    />
  );
}
