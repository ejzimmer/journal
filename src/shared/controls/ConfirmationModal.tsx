import { Modal, ModalProps } from './Modal';
import {
  ConfirmationModalContents,
  ConfirmationModalContentsProps,
} from './ConfirmationModalContents';

export type ConfirmationModalProps = ConfirmationModalContentsProps & {
  trigger: ModalProps['trigger'];
};

export function ConfirmationModal({
  trigger,
  ...props
}: ConfirmationModalProps) {
  return (
    <Modal trigger={trigger}>
      <ConfirmationModalContents {...props} />
    </Modal>
  );
}
