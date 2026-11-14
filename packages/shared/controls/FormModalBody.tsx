import { useRef } from 'react';
import { Modal } from './Modal';
import { useModal } from './ModalContext';
import { FormModalProps } from './FormModal';

type FormModalBodyProps = Omit<FormModalProps, 'trigger' | 'onClose'>;

export function FormModalBody({
  submitButtonContent,
  submitButtonClassName,
  cancelButtonContent = 'Cancel',
  onSubmit,
  children,
  formRef,
}: FormModalBodyProps) {
  const internalRef = useRef<HTMLFormElement>(null);
  const ref = formRef ?? internalRef;
  const { closeModal } = useModal();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await onSubmit(event)) {
      ref.current?.reset();
      closeModal();
    }
  };

  return (
    <form onSubmit={handleSubmit} ref={ref}>
      <Modal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {children}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Modal.Cancel>{cancelButtonContent}</Modal.Cancel>
        <Modal.Action className={`primary ${submitButtonClassName ?? ''}`}>
          {submitButtonContent}
        </Modal.Action>
      </Modal.Footer>
    </form>
  );
}
