import { render, screen } from '@testing-library/react';
import { EditChapterForm } from './EditChapterForm';
import { openDisclosureForm } from './disclosureFormTestUtils';
import { Chapter } from './types';

describe('EditChapterForm', () => {
  const chapter: Chapter = { id: 'c1', number: 1, lookups: 0, aiQuestions: 0 };

  it('saves the new name and last page', async () => {
    const onChange = jest.fn();
    render(
      <EditChapterForm
        name="Chapter 1"
        chapter={chapter}
        onChange={onChange}
      />,
    );
    const { user, save } = await openDisclosureForm('Edit');

    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'Prologue');
    await user.type(
      screen.getByRole('spinbutton', { name: 'Last page' }),
      '38',
    );
    await save();

    expect(onChange).toHaveBeenCalledWith({
      number: 1,
      name: 'Prologue',
      lastPage: 38,
    });
  });
});
