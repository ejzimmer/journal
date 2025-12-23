import {
  ConfirmationModal,
  Props as ConfirmationModalProps,
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
