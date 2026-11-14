import { ReactNode } from 'react';

type DragPreviewProps = {
  children: ReactNode;
};

export function DragPreview({ children }: DragPreviewProps) {
  return <div className="drag-preview">{children}</div>;
}
