import { AddProjectForm } from './projects/AddProjectForm';
import { ProjectList } from './projects/ProjectList';
import { useMoveFinishedProjects } from './projects/useMoveFinishedProjects';
import { useProjectActions } from './projects/useProjectActions';
import { useProjectLists } from './projects/useProjectLists';
import { YarnTracking } from './yarnBowl';

export function ProjectsTab() {
  const { lists } = useProjectLists();
  const { addProject, moveProject } = useProjectActions();
  useMoveFinishedProjects();

  return (
    <div className="projects-tab">
      <div className="queues">
        <section className="yarn-bowl" aria-label="Yarn bowl">
          <YarnTracking />
        </section>
        <ProjectList
          listKey="priority"
          projects={lists.priority}
          onMove={moveProject}
        />
        <ProjectList
          listKey="portable"
          projects={lists.portable}
          onMove={moveProject}
        />
      </div>
      <section className="future-projects" aria-label="Future projects">
        <ProjectList
          listKey="future"
          projects={lists.future}
          onMove={moveProject}
        />
        <AddProjectForm onAdd={addProject} />
      </section>
      <ProjectList listKey="done" projects={lists.done} />
    </div>
  );
}
