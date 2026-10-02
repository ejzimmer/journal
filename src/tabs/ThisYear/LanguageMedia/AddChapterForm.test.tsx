import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AddChapterForm } from './AddChapterForm';

describe('AddChapterForm', () => {
  it('adds the next chapter with its name and last page', async () => {
    const user = userEvent.setup();
    const onAdd = jest.fn();
    render(
      <AddChapterForm
        chapters={{ c1: { id: 'c1', number: 1, lookups: 0, aiQuestions: 0 } }}
        onAdd={onAdd}
      />,
    );

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Prologue');
    await user.type(
      screen.getByRole('spinbutton', { name: 'Last page' }),
      '38',
    );
    await user.click(screen.getByRole('button', { name: 'Add chapter' }));

    expect(onAdd).toHaveBeenCalledWith({
      number: 2,
      name: 'Prologue',
      lastPage: 38,
      lookups: 0,
      aiQuestions: 0,
    });
  });

  it('clears the form after adding', async () => {
    const user = userEvent.setup();
    render(<AddChapterForm onAdd={jest.fn()} />);
    const name = screen.getByRole('textbox', { name: 'Name' });

    await user.type(name, 'Prologue');
    await user.click(screen.getByRole('button', { name: 'Add chapter' }));

    expect(name).toHaveValue('');
  });
});
