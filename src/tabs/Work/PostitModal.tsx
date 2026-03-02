import {
  ConfirmationModal,
  ConfirmationModalDialog,
  ConfirmationModalDialogProps,
  ConfirmationModalProps,
} from "../../shared/controls/ConfirmationModal"

import "./PostitModal.css"

export function PostitModal(props: ConfirmationModalProps) {
  return (
    <div className="post-it">
      <ConfirmationModal
        {...props}
        confirmButtonText="Yes"
        cancelButtonText="No"
      />
    </div>
  )
}

export function PostitModalDialog(props: ConfirmationModalDialogProps) {
  return (
    <div className="post-it">
      <ConfirmationModalDialog
        {...props}
        confirmButtonText="Yes"
        cancelButtonText="No"
      />
    </div>
  )
}
