import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStorage } from '../../shared/storageContextTestUtils';
import { PROJECTS_KEY } from '../../shared/types';
import { AddProjectForm } from './AddProjectForm';

function renderForm() {
  const addItem = jest.fn().mockReturnValue('new-project');
  renderWithStorage(<AddProjectForm />, { value: { addItem } });

  return { addItem };
}

async function addProject(description: string, category: string) {
  const user = userEvent.setup();
  await user.type(
    screen.getByRole('textbox', { name: 'Description' }),
    description,
  );
  await user.selectOptions(
    screen.getByRole('combobox', { name: 'Category' }),
    category,
  );
  await user.click(screen.getByRole('button'));
}

describe('AddProjectForm', () => {
  describe('adding a sock project', () => {
    it('saves a knitting project with no sock sections knitted', async () => {
      const { addItem } = renderForm();

      await addProject('Rainbow socks', '🧦');

      expect(addItem).toHaveBeenCalledWith(
        PROJECTS_KEY,
        expect.objectContaining({
          description: 'Rainbow socks',
          category: '🧶',
          socks: {
            direction: 'cuff_down',
            knittedSections: { first: 0, second: 0 },
          },
        }),
      );
    });

    it('gives it a finishing subtask', async () => {
      const { addItem } = renderForm();

      await addProject('Rainbow socks', '🧦');

      expect(addItem).toHaveBeenCalledWith(
        `${PROJECTS_KEY}/new-project/subtasks`,
        expect.objectContaining({ description: 'Finishing', status: 'ready' }),
      );
    });
  });

  describe('adding a knitting project', () => {
    it('saves it as a plain project', async () => {
      const { addItem } = renderForm();

      await addProject('Cardigan', '🧶');

      expect(addItem).toHaveBeenCalledWith(PROJECTS_KEY, {
        description: 'Cardigan',
        category: '🧶',
        parentId: PROJECTS_KEY,
        position: expect.any(Number),
      });
    });
  });
});
