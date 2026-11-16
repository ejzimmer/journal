import './ProjectList.css';
import { ProjectCard } from './ProjectCard';
import { LIST_LABELS } from './projectTypes';
import { ListKey, Project } from './types';

type ProjectListProps = {
  listKey: ListKey;
  projects: Project[];
  onMove: (projectId: string, from: ListKey, to: ListKey) => void;
};

export function ProjectList({ listKey, projects, onMove }: ProjectListProps) {
  return (
    <ol className={`project-list ${listKey}`} aria-label={LIST_LABELS[listKey]}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          listKey={listKey}
          onMove={(targetList) => onMove(project.id, listKey, targetList)}
        />
      ))}
    </ol>
  );
}
