import { ModalDialog } from './ModalDialog';
import {
  ConfirmationModalContents,
  ConfirmationModalContentsProps,
} from './ConfirmationModalContents';

export type ConfirmationModalDialogProps = ConfirmationModalContentsProps & {
  isOpen: boolean;
  onCancel: () => void;
};

export function ConfirmationModalDialog({
  isOpen,
  onCancel,
  ...props
}: ConfirmationModalDialogProps) {
  return (
    <ModalDialog isOpen={isOpen} onCancel={onCancel}>
      <ConfirmationModalContents {...props} />
    </ModalDialog>
  );
}
