import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithStorage } from 'shared/storageContextTestUtils';
import { PROJECTS_KEY } from '../../types';
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
  describe('adding a project', () => {
    it('saves it with its category', async () => {
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

  describe('after adding a project', () => {
    it('clears the description', async () => {
      renderForm();

      await addProject('Cardigan', '🧶');

      expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
        '',
      );
    });

    it('keeps the chosen category', async () => {
      renderForm();

      await addProject('Cardigan', '🧶');

      expect(screen.getByRole('combobox', { name: 'Category' })).toHaveValue(
        '🧶',
      );
    });
  });
});
