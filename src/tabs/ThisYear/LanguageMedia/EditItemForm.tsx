import { ReactNode, useState } from 'react';

export function EditItemForm({
  name,
  onSubmit,
  children,
}: {
  name: string;
  onSubmit: (data: FormData) => void;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const submitItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
    setIsOpen(false);
  };

  return (
    <details
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary aria-label={`Edit ${name}`}>Edit</summary>
      {isOpen && (
        <form aria-label={`Edit ${name}`} onSubmit={submitItem}>
          {children}
          <button type="submit">Save</button>
        </form>
      )}
    </details>
  );
}
