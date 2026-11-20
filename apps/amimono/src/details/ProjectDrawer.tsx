import { useState } from 'react';

import './ProjectDrawer.css';
import { ChevronDownIcon } from 'shared/icons/ChevronDown';
import { PencilIcon } from 'shared/icons/Pencil';
import { Project } from '../projects/types';
import { getSockProgress } from '../socks/getSockProgress';
import { SockTracker } from '../socks/SockTracker';
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
  const socks = getSockProgress(project);

  return (
    <div className="project-drawer">
      <div className="drawer-header">
        {hasDetails && (
          <button
            className="details-toggle"
            aria-expanded={areDetailsOpen}
            onClick={() => setAreDetailsOpen(!areDetailsOpen)}
          >
            <ChevronDownIcon />
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
      {socks && <SockTracker project={project} socks={socks} />}
      <SubtaskList
        projectId={project.id}
        subtasks={Object.values(project.subtasks ?? {})}
      />
    </div>
  );
}
