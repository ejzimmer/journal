import { ReactNode, RefObject } from 'react';

type EditSubtasksButtonProps = {
  ref?: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
  children: ReactNode;
};

export function EditSubtasksButton({
  ref,
  onClick,
  children,
}: EditSubtasksButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className="edit-subtasks"
      aria-label="Edit subtasks"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
