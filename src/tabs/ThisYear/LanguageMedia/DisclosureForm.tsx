import { ReactNode, useState } from 'react';

export function DisclosureForm({
  summary,
  label,
  onSubmit,
  children,
}: {
  summary: string;
  label: string;
  onSubmit: (data: FormData) => void;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
    setIsOpen(false);
  };

  return (
    <details
      open={isOpen}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary aria-label={label}>{summary}</summary>
      {isOpen && (
        <form aria-label={label} onSubmit={submitForm}>
          {children}
          <button type="submit">Save</button>
        </form>
      )}
    </details>
  );
}
