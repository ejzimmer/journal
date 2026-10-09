import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStorage } from '../../shared/storageContextTestUtils';
import { ProjectDetails, PROJECTS_KEY } from '../../shared/types';
import { Projects } from '.';

const createProject = (
  id: string,
  position: number,
  status: ProjectDetails['status'],
  extra: Partial<ProjectDetails> = {},
): ProjectDetails => ({
  id,
  parentId: PROJECTS_KEY,
  description: id,
  category: '🧶',
  status,
  position,
  ...extra,
});

function renderProjects(projects: ProjectDetails[]) {
  const updateList = jest.fn();
  const updateItem = jest.fn();
  renderWithStorage(<Projects />, {
    value: {
      updateList,
      updateItem,
      useValue: <T,>(key?: string) => ({
        value: (key === PROJECTS_KEY
          ? Object.fromEntries(projects.map((project) => [project.id, project]))
          : undefined) as T | undefined,
        loading: false,
        synced: false,
      }),
    },
  });

  return { updateList, updateItem };
}

describe('Projects', () => {
  describe('move to end', () => {
    const projects = [
      createProject('knitting', 0, 'in_progress'),
      createProject('sewing', 1, 'ready'),
      createProject('quilting', 2, 'ready'),
      createProject('weaving', 3, 'done'),
    ];

    describe('on a ready project', () => {
      it('moves it to just before the done projects', async () => {
        const user = userEvent.setup();
        const { updateList } = renderProjects(projects);

        await user.click(screen.getByRole('button', { name: 'Move to end' }));

        expect(updateList).toHaveBeenCalledWith(
          PROJECTS_KEY,
          expect.any(Array),
        );
        const reordered: ProjectDetails[] = updateList.mock.calls[0][1];
        expect(reordered.map((project) => project.id)).toEqual([
          'knitting',
          'quilting',
          'sewing',
          'weaving',
        ]);
      });
    });
  });

  describe('years', () => {
    beforeEach(() => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(new Date('2027-02-10'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const getProjectNames = () =>
      screen
        .getAllByRole('listitem')
        .map((item) => within(item).getByText(/ing$/).textContent);

    describe('when projects were finished in earlier years', () => {
      const projects = [
        createProject('knitting', 0, 'in_progress'),
        createProject('sewing', 1, 'ready'),
        createProject('quilting', 2, 'done', { completedAt: '2027-01-20' }),
        createProject('weaving', 3, 'done', { completedAt: '2025-06-01' }),
        createProject('spinning', 4, 'done'),
      ];

      it('has a tab for this year and each year a project was finished, newest first', () => {
        renderProjects(projects);

        expect(
          screen.getAllByRole('tab').map((tab) => tab.textContent),
        ).toEqual(['2027', '2026', '2025']);
      });

      describe('and this year is selected', () => {
        it('shows the unfinished projects and the ones finished this year', () => {
          renderProjects(projects);

          expect(getProjectNames()).toEqual(['knitting', 'sewing', 'quilting']);
        });
      });

      describe('and an earlier year is selected', () => {
        it('shows only the projects finished that year', async () => {
          const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
          });
          renderProjects(projects);

          await user.click(screen.getByRole('tab', { name: '2025' }));

          expect(getProjectNames()).toEqual(['weaving']);
        });

        describe('when a project has no finish date', () => {
          it('counts it as finished in 2026', async () => {
            const user = userEvent.setup({
              advanceTimers: jest.advanceTimersByTime,
            });
            renderProjects(projects);

            await user.click(screen.getByRole('tab', { name: '2026' }));

            expect(getProjectNames()).toEqual(['spinning']);
          });
        });

        it('hides the add project form', async () => {
          const user = userEvent.setup({
            advanceTimers: jest.advanceTimersByTime,
          });
          renderProjects(projects);
          const addDescription = screen.getByRole('textbox', {
            name: 'Description',
          });

          await user.click(screen.getByRole('tab', { name: '2026' }));

          expect(addDescription).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('finishing a project', () => {
    beforeEach(() => {
      jest.useFakeTimers({ advanceTimers: true });
      jest.setSystemTime(new Date('2027-02-10'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('when an in-progress project is ticked off', () => {
      it('records today as the date it was finished', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        const knitting = createProject('knitting', 0, 'in_progress');
        const { updateItem } = renderProjects([knitting]);

        await user.click(
          within(screen.getByRole('listitem')).getByRole('checkbox'),
        );

        expect(updateItem).toHaveBeenCalledWith(PROJECTS_KEY, {
          ...knitting,
          status: 'done',
          completedAt: '2027-02-10',
        });
      });
    });

    describe('when a finished project is unticked', () => {
      it('drops the date it was finished', async () => {
        const user = userEvent.setup({
          advanceTimers: jest.advanceTimersByTime,
        });
        const knitting = createProject('knitting', 0, 'done', {
          completedAt: '2027-02-01',
        });
        const { updateItem } = renderProjects([knitting]);

        await user.click(
          within(screen.getByRole('listitem')).getByRole('checkbox'),
        );

        expect(updateItem).toHaveBeenCalledWith(
          PROJECTS_KEY,
          createProject('knitting', 0, 'ready'),
        );
      });
    });
  });
});
