import { Combobox } from 'shared/controls/combobox/Combobox';
import { useRecipients } from '../sockPlanner/useRecipients';

import './RecipientPicker.css';

type RecipientPickerProps = {
  recipientId?: string;
  onChange: (recipientId: string | undefined) => void;
};

export function RecipientPicker({
  recipientId,
  onChange,
}: RecipientPickerProps) {
  const { recipients } = useRecipients();
  const options = recipients.map(({ id, name }) => ({ id, label: name }));

  return (
    <div className="edit-field recipient-picker">
      <Combobox
        label="Recipient"
        value={options.find((option) => option.id === recipientId)}
        options={options}
        onChange={(option) => onChange(option.id)}
        onClear={() => onChange(undefined)}
      />
    </div>
  );
}
