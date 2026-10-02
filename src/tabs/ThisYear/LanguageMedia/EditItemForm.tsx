import { ReactNode } from 'react';
import { DisclosureForm } from './DisclosureForm';

export function EditItemForm({
  name,
  onSubmit,
  children,
}: {
  name: string;
  onSubmit: (data: FormData) => void;
  children: ReactNode;
}) {
  return (
    <DisclosureForm summary="Edit" label={`Edit ${name}`} onSubmit={onSubmit}>
      {children}
    </DisclosureForm>
  );
}
