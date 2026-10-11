import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddDueDateTaskForm } from './AddDueDateTaskForm';
import { CategoriesContext } from '..';
import { renderWithStorage } from '../../../shared/storageContextTestUtils';

const renderForm = () => {
  const addItem = jest.fn();
  renderWithStorage(
    <CategoriesContext.Provider value={['🛒']}>
      <AddDueDateTaskForm />
    </CategoriesContext.Provider>,
    { value: { addItem } },
  );
  return addItem;
};

const fillInTask = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(
    screen.getByRole('textbox', { name: 'Description' }),
    'Japanese lesson',
  );
  const dueDate = screen.getByLabelText('Due date');
  await user.clear(dueDate);
  await user.type(dueDate, '2026-10-14');
};

describe('AddDueDateTaskForm', () => {
  describe('when the user ticks Repeats weekly', () => {
    it('adds a repeating task', async () => {
      const user = userEvent.setup();
      const addItem = renderForm();

      await fillInTask(user);
      await user.click(
        screen.getByRole('checkbox', { name: 'Repeats weekly' }),
      );
      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(addItem).toHaveBeenCalledWith(
        'today/暦',
        expect.objectContaining({
          description: 'Japanese lesson',
          dueDate: '2026-10-14',
          repeats: true,
        }),
      );
    });
  });

  describe('when the user leaves Repeats weekly unticked', () => {
    it('adds a one-off task', async () => {
      const user = userEvent.setup();
      const addItem = renderForm();

      await fillInTask(user);
      await user.click(screen.getByRole('button', { name: 'Create' }));

      expect(addItem).toHaveBeenCalledWith(
        'today/暦',
        expect.objectContaining({ repeats: false }),
      );
    });
  });
});
