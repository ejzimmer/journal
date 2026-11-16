import { AppUpdateButton } from 'shared/AppUpdateButton';

import './HomePage.css';
import { AddProjectForm } from './projects/AddProjectForm';
import { ProjectList } from './projects/ProjectList';
import { useProjectActions } from './projects/useProjectActions';
import { useMoveFinishedProjects } from './projects/useMoveFinishedProjects';
import { useProjectLists } from './projects/useProjectLists';
import { YarnTracking } from './yarnBowl';
import { YARN_COLOUR_PROPERTIES } from './yarnBowl/utils';

export function HomePage() {
  const { lists } = useProjectLists();
  const { addProject, moveProject } = useProjectActions();
  useMoveFinishedProjects();

  return (
    <main className="home-page" style={YARN_COLOUR_PROPERTIES}>
      <h1 className="visually-hidden">Amimono</h1>
      <AppUpdateButton />
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
    </main>
  );
}
