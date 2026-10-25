import { ModalDialog } from '../../shared/controls/ModalDialog';
import { MediaForm, MediaFormConfig } from './MediaForm';
import { MediaDetails } from './types';

export function EditMediaForm<T extends MediaDetails>({
  item,
  isOpen,
  onCancel,
  config,
}: {
  item: T;
  isOpen: boolean;
  onCancel: () => void;
  config: MediaFormConfig<T>;
}) {
  return (
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      {isOpen && <MediaForm item={item} config={config} />}
    </ModalDialog>
  );
}
