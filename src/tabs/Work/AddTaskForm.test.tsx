import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatDayAndMonth, getToday } from '../../shared/dates';
import { AddTaskForm } from './AddTaskForm';
import { WorkStorageContext } from './WorkStorageContext';
import { createWorkStorageContext } from './workStorageTestUtils';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <WorkStorageContext.Provider value={createWorkStorageContext()}>
    {children}
  </WorkStorageContext.Provider>
);

const commonProps = {
  onSubmit: jest.fn(),
  onClose: jest.fn(),
};

const enterDueDate = async (
  user: ReturnType<typeof userEvent.setup>,
  date: string,
  finalKey: '{Enter}' | '{Escape}' = '{Enter}',
) => {
  await user.click(screen.getByRole('button', { name: '📅' }));
  await user.click(screen.getByRole('button', { name: /^Due date/ }));
  // Testing library doesn't handle date inputs well
  fireEvent.change(screen.getByLabelText('Due date'), {
    target: { value: date },
  });
  await user.keyboard(finalKey);
};

const addLabel = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string,
) => {
  await user.click(screen.getByRole('button', { name: 'Add label' }));
  await user.type(
    screen.getByRole('combobox', { name: 'Labels' }),
    `${value}{Enter}`,
  );
};

describe('AddTaskForm', () => {
  it('adds a task with just a description', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });

    const descriptionInput = screen.getByRole('textbox', {
      name: 'Description',
    });
    await user.type(descriptionInput, 'Approve PR');
    await user.keyboard('{Enter}');

    expect(onSubmit).toHaveBeenCalledWith({
      description: 'Approve PR',
      labels: [],
    });
  });

  it("doesn't add a task with no description", async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });

    await enterDueDate(user, '2026-01-01');
    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('adds a task with a due date and a description', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });

    const descriptionInput = screen.getByRole('textbox', {
      name: 'Description',
    });
    await user.type(descriptionInput, 'Approve PR');
    await enterDueDate(user, '2026-01-01');
    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(onSubmit).toHaveBeenCalledWith({
      description: 'Approve PR',
      dueDate: '2026-01-01',
      labels: [],
    });
  });

  it('adds a task with labels', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });

    const descriptionInput = screen.getByRole('textbox', {
      name: 'Description',
    });
    await user.type(descriptionInput, 'Approve PR');
    await addLabel(user, 'PR');
    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(onSubmit).toHaveBeenCalledWith({
      description: 'Approve PR',
      labels: [{ value: 'PR', colour: 'blue' }],
    });
  });

  it('removes a label before the task is added', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<AddTaskForm {...commonProps} onSubmit={onSubmit} />, {
      wrapper: Wrapper,
    });

    const descriptionInput = screen.getByRole('textbox', {
      name: 'Description',
    });
    await user.type(descriptionInput, 'Approve PR');
    await addLabel(user, 'PR');
    await user.click(screen.getByRole('button', { name: 'Remove PR' }));
    await user.click(screen.getByRole('button', { name: 'submit' }));

    expect(onSubmit).toHaveBeenCalledWith({
      description: 'Approve PR',
      labels: [],
    });
  });

  it('returns focus to the add label button when the label picker closes', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm {...commonProps} />, { wrapper: Wrapper });

    await addLabel(user, 'PR');

    expect(screen.getByRole('button', { name: 'Add label' })).toHaveFocus();
  });

  it('returns focus to the due date when the date input closes', async () => {
    const user = userEvent.setup();
    render(<AddTaskForm {...commonProps} />, { wrapper: Wrapper });

    await enterDueDate(user, '2026-01-01');

    expect(
      screen.getByRole('button', { name: 'Due date 01 Jan' }),
    ).toHaveFocus();
  });

  it('abandons the date edit, not the form, when Escape closes the date input', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<AddTaskForm {...commonProps} onClose={onClose} />, {
      wrapper: Wrapper,
    });

    const today = formatDayAndMonth(getToday());
    await enterDueDate(user, '2026-01-01', '{Escape}');

    expect(onClose).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: `Due date ${today}` }),
    ).toBeInTheDocument();
  });

  describe('when the user presses the Escape key', () => {
    it('call onCancel', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(<AddTaskForm {...commonProps} onClose={onCancel} />, {
        wrapper: Wrapper,
      });

      const descriptionInput = screen.getByRole('textbox', {
        name: 'Description',
      });
      await user.type(descriptionInput, 'Approve PR');
      await user.keyboard('{Escape}');

      expect(onCancel).toHaveBeenCalled();
    });
  });
});
