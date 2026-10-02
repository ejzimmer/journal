import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComprehensionForm } from './ComprehensionForm';

const comprehension = { lookups: 3, aiQuestions: 1, understood: 80 };

describe('ComprehensionForm', () => {
  const renderForm = async (onChange = jest.fn()) => {
    const user = userEvent.setup();
    render(
      <ComprehensionForm
        name="Episode 1"
        comprehension={comprehension}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByText('Totals'));
    return {
      user,
      onChange,
      replaceValue: async (label: string, value: string) => {
        const input = screen.getByRole('spinbutton', { name: label });
        await user.clear(input);
        if (value) await user.type(input, value);
      },
      save: () => user.click(screen.getByRole('button', { name: 'Save' })),
    };
  };

  it('saves the new totals', async () => {
    const { replaceValue, save, onChange } = await renderForm();

    await replaceValue('Looked up', '0');
    await replaceValue('Asked AI', '5');
    await replaceValue('Understood (%)', '65');
    await save();

    expect(onChange).toHaveBeenCalledWith({
      lookups: 0,
      aiQuestions: 5,
      understood: 65,
    });
  });

  describe('when understood is cleared', () => {
    it('saves the totals without it', async () => {
      const { replaceValue, save, onChange } = await renderForm();

      await replaceValue('Understood (%)', '');
      await save();

      expect(onChange).toHaveBeenCalledWith({
        lookups: 3,
        aiQuestions: 1,
        understood: undefined,
      });
    });
  });

  describe('with understood over 100%', () => {
    it('does not save', async () => {
      const { replaceValue, save, onChange } = await renderForm();

      await replaceValue('Understood (%)', '120');
      await save();

      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
