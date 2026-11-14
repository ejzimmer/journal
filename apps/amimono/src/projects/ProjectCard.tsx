import { useState } from 'react';

import './ProjectCard.css';
import { ProjectDrawer } from '../details/ProjectDrawer';
import { ProjectEditForm } from '../edit/ProjectEditForm';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { countProjectSteps } from './countProjectSteps';
import { CraftIcon } from './CraftIcon';
import { createCardStyle } from './createCardStyle';
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
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <ProjectEditForm
        project={project}
        listKey={listKey}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  const projectType = PROJECT_TYPES[project.type];
  const steps = countProjectSteps(project);
  const classNames = [
    'project-card',
    listKey !== 'future' && 'queued',
    isExpanded && 'expanded',
  ].filter(Boolean);
  const expandLabel = isExpanded ? 'Collapse project' : 'Expand project';

  return (
    <li className={classNames.join(' ')} style={createCardStyle(project.type)}>
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
      {steps.totalCount > 0 && <SubtaskProgress {...steps} />}
      {isExpanded && (
        <ProjectDrawer project={project} onEdit={() => setIsEditing(true)} />
      )}
    </li>
  );
}
