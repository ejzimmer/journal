import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStorage } from '../../shared/storageContextTestUtils';
import { ProjectDetails, PROJECTS_KEY } from '../../shared/types';
import { Projects } from '.';

const createProject = (
  id: string,
  position: number,
  status: ProjectDetails['status'],
): ProjectDetails => ({
  id,
  parentId: PROJECTS_KEY,
  description: id,
  category: '🧶',
  status,
  position,
});

function renderProjects(projects: ProjectDetails[]) {
  const updateList = jest.fn();
  renderWithStorage(<Projects />, {
    value: {
      updateList,
      useValue: <T,>(key?: string) => ({
        value: (key === PROJECTS_KEY
          ? Object.fromEntries(projects.map((project) => [project.id, project]))
          : undefined) as T | undefined,
        loading: false,
        synced: false,
      }),
    },
  });

  return { updateList };
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
});
