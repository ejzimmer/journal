import { ModalDialog } from '../../shared/controls/ModalDialog';
import { MediaForm, MediaFormConfig } from './MediaForm';
import { MediaDetails } from './types';

type EditMediaFormProps<T extends MediaDetails> = {
  item: T;
  isOpen: boolean;
  onCancel: () => void;
  config: MediaFormConfig<T>;
};

export function EditMediaForm<T extends MediaDetails>({
  item,
  isOpen,
  onCancel,
  config,
}: EditMediaFormProps<T>) {
  return (
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      {isOpen && <MediaForm item={item} config={config} />}
    </ModalDialog>
  );
}
