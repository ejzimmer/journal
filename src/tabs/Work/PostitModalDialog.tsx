import {
  ConfirmationModalDialog,
  ConfirmationModalDialogProps,
} from '../../shared/controls/ConfirmationModalDialog';

import './PostitModal.css';

export function PostitModalDialog(props: ConfirmationModalDialogProps) {
  return (
    <div className="post-it">
      <ConfirmationModalDialog
        {...props}
        confirmButtonText="Yes"
        cancelButtonText="No"
      />
    </div>
  );
}
