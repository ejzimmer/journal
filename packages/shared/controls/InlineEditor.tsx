import { KeyboardEvent, ReactNode } from 'react';

type InlineEditorProps = {
  className: string;
  onSave: () => void;
  onClose: () => void;
  children: ReactNode;
};

export function InlineEditor({
  className,
  onSave,
  onClose,
  children,
}: InlineEditorProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      onSave();
    }

    if (event.key === 'Enter' || event.key === 'Escape') {
      // If onClose moves focus to a button during this keydown, the browser
      // would then click that button on Enter.
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className={className} onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
}
