import { Combobox } from 'shared/controls/combobox/Combobox';

import { useRavelryYarnSearch } from '../ravelry/useRavelryYarnSearch';

const TYPED_YARN_ID = 'typed';

export type YarnName = {
  name: string;
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
  const options = yarns.map((yarn) => ({
    id: String(yarn.id),
    label: yarn.name,
  }));
  const value = name
    ? { id: ravelryId ? String(ravelryId) : TYPED_YARN_ID, label: name }
    : undefined;

  return (
    <Combobox
      ariaLabel="Yarn name"
      value={value}
      options={options}
      onSearch={(searchTerm) => {
        searchYarns(searchTerm);
        if (!searchTerm.trim()) onChange({ name: '' });
      }}
      createOption={(label) => ({ id: TYPED_YARN_ID, label })}
      onChange={(option) =>
        onChange(
          option.id === TYPED_YARN_ID
            ? { name: option.label }
            : { name: option.label, ravelryId: Number(option.id) },
        )
      }
    />
  );
}
