import { CSSProperties } from 'react';

import './ProjectCard.css';
import { MoveProjectMenu } from './MoveProjectMenu';
import { PROJECT_TYPES } from './projectTypes';
import { SubtaskProgress } from './SubtaskProgress';
import { ListKey, Project } from './types';

type ProjectCardProps = {
  project: Project;
  listKey: ListKey;
  onMove: (targetList: ListKey) => void;
};

export function ProjectCard({ project, listKey, onMove }: ProjectCardProps) {
  const projectType = PROJECT_TYPES[project.type];
  const subtasks = Object.values(project.subtasks ?? {});
  const colours = {
    '--card-pastel': projectType.pastel,
    '--card-dark': projectType.dark,
  } as CSSProperties;

  return (
    <li
      className={`project-card${listKey === 'future' ? '' : ' queued'}`}
      style={colours}
    >
      <div className="project-card-header">
        <img
          className="project-type-icon"
          src={projectType.icon}
          alt={projectType.label}
        />
        <span className="project-name">{project.name}</span>
        <MoveProjectMenu currentList={listKey} onMove={onMove} />
      </div>
      {subtasks.length > 0 && <SubtaskProgress subtasks={subtasks} />}
    </li>
  );
}
