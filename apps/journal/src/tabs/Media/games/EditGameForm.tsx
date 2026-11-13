import { GameDetails } from '../types';
import { MediaEditFormProps } from '../MediaSpine';
import { EditMediaForm } from '../EditMediaForm';
import { useGameFormConfig } from './gameFormConfig';

export function EditGameForm({
  item,
  isOpen,
  onCancel,
}: MediaEditFormProps<GameDetails>) {
  return (
    <EditMediaForm
      item={item}
      isOpen={isOpen}
      onCancel={onCancel}
      config={useGameFormConfig()}
    />
  );
}
