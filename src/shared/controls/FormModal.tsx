import { RefObject, useRef } from 'react';
import { Modal, ModalProps, useModal } from './Modal';

export type FormModalProps = {
  children: React.ReactNode;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => boolean | Promise<boolean>;
  submitButtonContent?: React.ReactNode;
  cancelButtonContent?: React.ReactNode;
  onClose?: () => void;
  trigger: ModalProps['trigger'];
  formRef?: RefObject<HTMLFormElement | null>;
};

export function FormModal({ trigger, onClose, ...props }: FormModalProps) {
  return (
    <Modal trigger={trigger} onClose={onClose}>
      <FormBody {...props} />
    </Modal>
  );
}

function FormBody({
  submitButtonContent,
  cancelButtonContent = 'Cancel',
  onSubmit,
  children,
  formRef,
}: Omit<FormModalProps, 'trigger' | 'onClose'>) {
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
        <Modal.Action className="primary">{submitButtonContent}</Modal.Action>
      </Modal.Footer>
    </form>
  );
}
