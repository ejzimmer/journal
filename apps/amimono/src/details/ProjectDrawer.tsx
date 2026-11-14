import { useState } from 'react';

import './ProjectDrawer.css';
import { PencilIcon } from 'shared/icons/Pencil';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { Project } from '../projects/types';
import { SubtaskList } from '../subtasks/SubtaskList';
import { hasProjectDetails } from './hasProjectDetails';
import { ProjectDetails } from './ProjectDetails';

type ProjectDrawerProps = {
  project: Project;
  onEdit: () => void;
};

export function ProjectDrawer({ project, onEdit }: ProjectDrawerProps) {
  const [areDetailsOpen, setAreDetailsOpen] = useState(false);
  const hasDetails = hasProjectDetails(project);

  return (
    <div className="project-drawer">
      <div className="drawer-header">
        {hasDetails && (
          <button
            className="details-toggle"
            aria-expanded={areDetailsOpen}
            onClick={() => setAreDetailsOpen(!areDetailsOpen)}
          >
            <ChevronRightIcon />
            Details
          </button>
        )}
        <button
          className="card-control edit-button"
          aria-label="Edit project"
          title="Edit project"
          onClick={onEdit}
        >
          <PencilIcon width="17" />
        </button>
      </div>
      {hasDetails && areDetailsOpen && <ProjectDetails project={project} />}
      <SubtaskList
        projectId={project.id}
        subtasks={Object.values(project.subtasks ?? {})}
      />
    </div>
  );
}
