import { useState } from 'react';

import './ProjectDrawer.css';
import { ChevronDownIcon } from 'shared/icons/ChevronDown';
import { Project } from '../projects/types';
import { SubtaskList } from '../subtasks/SubtaskList';
import { hasProjectDetails } from './hasProjectDetails';
import { ProjectDetails } from './ProjectDetails';

type ProjectDrawerProps = {
  project: Project;
};

export function ProjectDrawer({ project }: ProjectDrawerProps) {
  const [areDetailsOpen, setAreDetailsOpen] = useState(false);

  return (
    <div className="project-drawer">
      {hasProjectDetails(project) && (
        <>
          <button
            className="details-toggle"
            aria-expanded={areDetailsOpen}
            onClick={() => setAreDetailsOpen(!areDetailsOpen)}
          >
            <ChevronDownIcon />
            Details
          </button>
          {areDetailsOpen && <ProjectDetails project={project} />}
        </>
      )}
      <SubtaskList
        projectId={project.id}
        subtasks={Object.values(project.subtasks ?? {})}
      />
    </div>
  );
}
