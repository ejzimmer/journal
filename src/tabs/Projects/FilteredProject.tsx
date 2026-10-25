import { CSSProperties, useRef } from 'react';
import { Category, ProjectDetails } from '../../shared/types';
import { useGridColumnSpan } from './useGridColumnSpan';

type FilteredProjectProps = {
  filter: Category[];
  project: ProjectDetails;
  children: React.ReactNode;
};

export function FilteredProject({
  filter: categories,
  project,
  children,
}: FilteredProjectProps) {
  const itemRef = useRef<HTMLLIElement>(null);
  const isVisible = !categories.length || categories.includes(project.category);
  const rowSpan = (project.status ?? 'ready') === 'in_progress' ? 2 : 1;

  useGridColumnSpan(itemRef, project, isVisible);

  return (
    <li
      ref={itemRef}
      className={`project-item ${isVisible ? '' : 'filtered-out'}`}
      style={{ '--row-span': rowSpan } as CSSProperties}
    >
      {children}
    </li>
  );
}
