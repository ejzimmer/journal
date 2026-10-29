import { RefObject } from 'react';
import { Modal, ModalProps } from './Modal';
import { FormModalBody } from './FormModalBody';

export type FormModalProps = {
  children: React.ReactNode;
  onSubmit: (
    event: React.FormEvent<HTMLFormElement>,
  ) => boolean | Promise<boolean>;
  submitButtonContent?: React.ReactNode;
  submitButtonClassName?: string;
  cancelButtonContent?: React.ReactNode;
  onClose?: () => void;
  trigger: ModalProps['trigger'];
  formRef?: RefObject<HTMLFormElement | null>;
};

export function FormModal({ trigger, onClose, ...props }: FormModalProps) {
  return (
    <Modal trigger={trigger} onClose={onClose}>
      <FormModalBody {...props} />
    </Modal>
  );
}
