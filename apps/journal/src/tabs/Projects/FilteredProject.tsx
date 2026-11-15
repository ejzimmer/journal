import { CSSProperties } from 'react';
import { Category, ProjectDetails } from '../../types';

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
  const isVisible = !categories.length || categories.includes(project.category);
  const rowSpan = (project.status ?? 'ready') === 'in_progress' ? 2 : 1;

  return (
    <li
      className={`project-item ${isVisible ? '' : 'filtered-out'}`}
      style={{ '--row-span': rowSpan } as CSSProperties}
    >
      {children}
    </li>
  );
}
