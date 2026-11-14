import { CSSProperties, useState } from 'react';

import './ProjectCard.css';
import { ProjectDrawer } from '../details/ProjectDrawer';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { CraftIcon } from './CraftIcon';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const projectType = PROJECT_TYPES[project.type];
  const subtasks = Object.values(project.subtasks ?? {});
  const colours = {
    '--card-pastel': projectType.pastel,
    '--card-dark': projectType.dark,
  } as CSSProperties;
  const classNames = [
    'project-card',
    listKey !== 'future' && 'queued',
    isExpanded && 'expanded',
  ].filter(Boolean);
  const expandLabel = isExpanded ? 'Collapse project' : 'Expand project';

  return (
    <li className={classNames.join(' ')} style={colours}>
      <div className="project-card-header">
        <img
          className="project-type-icon"
          src={projectType.icon}
          alt={projectType.label}
        />
        <span className="project-name">{project.name}</span>
        {project.craft && <CraftIcon craft={project.craft} />}
        <MoveProjectMenu currentList={listKey} onMove={onMove} />
        <button
          className="card-control expand-toggle"
          aria-label={expandLabel}
          title={expandLabel}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ChevronDownIcon />
        </button>
      </div>
      {subtasks.length > 0 && <SubtaskProgress subtasks={subtasks} />}
      {isExpanded && <ProjectDrawer project={project} />}
    </li>
  );
}
