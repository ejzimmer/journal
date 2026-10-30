import { Modal } from '../../shared/controls/Modal';
import { PlusIcon } from '../../shared/icons/Plus';
import { MediaForm, MediaFormConfig } from './MediaForm';
import { MediaDetails } from './types';

type AddMediaFormProps<T extends MediaDetails> = {
  ariaLabel: string;
  config: MediaFormConfig<T>;
};

export function AddMediaForm<T extends MediaDetails>({
  ariaLabel,
  config,
}: AddMediaFormProps<T>) {
  return (
    <Modal
      trigger={(props) => (
        <button {...props} className="outline icon" aria-label={ariaLabel}>
          <PlusIcon width="26" strokeWidth="3.5" />
        </button>
      )}
    >
      <MediaForm config={config} />
    </Modal>
  );
}
