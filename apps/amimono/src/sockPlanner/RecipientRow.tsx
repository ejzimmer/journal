import { DeleteWithConfirmation } from 'shared/controls/DeleteWithConfirmation';
import { CellInput } from './CellInput';
import { SockNumberCell } from './SockNumberCell';
import { Recipient, SockNumbers } from './types';

type RecipientRowProps = {
  recipient: Recipient;
  onUpdate: (fields: Partial<Pick<Recipient, 'name' | 'euSize'>>) => void;
  onOverride: (field: keyof SockNumbers, value: number | null) => void;
  onDelete: () => void;
};

export function RecipientRow({
  recipient,
  onUpdate,
  onOverride,
  onDelete,
}: RecipientRowProps) {
  const { name, euSize } = recipient;

  return (
    <tr>
      <th scope="row">
        <CellInput
          aria-label="Name"
          value={name}
          required
          onCommit={(text) => text && onUpdate({ name: text })}
        />
      </th>
      <td>
        <CellInput
          type="number"
          min="0"
          aria-label="Size"
          value={String(euSize)}
          onCommit={(text) => text && onUpdate({ euSize: Number(text) })}
        />
      </td>
      <SockNumberCell
        recipient={recipient}
        field="lengthMm"
        label="Length"
        step="1"
        onOverride={(value) => onOverride('lengthMm', value)}
      />
      <SockNumberCell
        recipient={recipient}
        field="castOnStitches"
        label="Cast-on stitches"
        step="4"
        onOverride={(value) => onOverride('castOnStitches', value)}
      />
      <SockNumberCell
        recipient={recipient}
        field="startToeAtMm"
        label="Start toe at"
        step="0.1"
        onOverride={(value) => onOverride('startToeAtMm', value)}
      />
      <td>
        <DeleteWithConfirmation
          className="delete-recipient"
          label={`Delete ${name}`}
          confirmLabel={`Confirm delete ${name}`}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}
