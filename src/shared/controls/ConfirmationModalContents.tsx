import { Modal } from './Modal';

export type ConfirmationModalContentsProps = {
  message: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  cancelButtonText?: string;
};

export function ConfirmationModalContents({
  message,
  onConfirm,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'No, cancel',
}: ConfirmationModalContentsProps) {
  return (
    <>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Modal.Cancel>{cancelButtonText}</Modal.Cancel>
        <Modal.Action onClick={onConfirm} className="danger">
          {confirmButtonText}
        </Modal.Action>
      </Modal.Footer>
    </>
  );
}
