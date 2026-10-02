import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComprehensionCounters } from './ComprehensionForms';

const comprehension = { lookups: 3, aiQuestions: 1, understood: 80 };

describe('ComprehensionCounters', () => {
  describe('when a lookup is added', () => {
    it('counts one more lookup', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <ComprehensionCounters
          name="Episode 1"
          comprehension={comprehension}
          onChange={onChange}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'Add a lookup to Episode 1' }),
      );

      expect(onChange).toHaveBeenCalledWith({ ...comprehension, lookups: 4 });
    });
  });

  describe('when an AI question is added', () => {
    it('counts one more AI question', async () => {
      const user = userEvent.setup();
      const onChange = jest.fn();
      render(
        <ComprehensionCounters
          name="Episode 1"
          comprehension={comprehension}
          onChange={onChange}
        />,
      );

      await user.click(
        screen.getByRole('button', { name: 'Add an AI question to Episode 1' }),
      );

      expect(onChange).toHaveBeenCalledWith({
        ...comprehension,
        aiQuestions: 2,
      });
    });
  });
});
