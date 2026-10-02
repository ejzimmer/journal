import { ReactNode } from 'react';

export function AddItemForm({
  label,
  onSubmit,
  children,
}: {
  label: string;
  onSubmit: (data: FormData) => void;
  children: ReactNode;
}) {
  const submitItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(new FormData(event.currentTarget));
    event.currentTarget.reset();
  };

  return (
    <form aria-label={label} onSubmit={submitItem}>
      {children}
      <button type="submit">{label}</button>
    </form>
  );
}
