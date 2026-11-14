import './HomePage.css';
import { AddProjectForm } from './projects/AddProjectForm';
import { ProjectList } from './projects/ProjectList';
import { useProjectActions } from './projects/useProjectActions';
import { useProjectLists } from './projects/useProjectLists';
import { YarnTracking } from './yarnBowl';

export function HomePage() {
  const { lists } = useProjectLists();
  const { addProject, moveProject } = useProjectActions();

  return (
    <main className="home-page">
      <h1 className="visually-hidden">Amimono</h1>
      <div className="queues">
        <section className="yarn-bowl" aria-label="Yarn bowl">
          <YarnTracking />
        </section>
        <ProjectList
          listKey="meetings"
          projects={lists.meetings}
          onMove={moveProject}
        />
        <ProjectList
          listKey="concentration"
          projects={lists.concentration}
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
    </main>
  );
}
