import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DurationField } from './DurationField';

describe('DurationField', () => {
  describe('in minutes and seconds', () => {
    it('has an input for each', () => {
      render(
        <DurationField label="Length" name="length" durationFormat="mm:ss" />,
      );

      expect(
        screen
          .getAllByRole('textbox')
          .map((input) => input.getAttribute('aria-label')),
      ).toEqual(['Minutes', 'Seconds']);
    });
  });

  describe('in hours, minutes and seconds', () => {
    it('has an input for each', () => {
      render(
        <DurationField
          label="Length"
          name="length"
          durationFormat="hh:mm:ss"
        />,
      );

      expect(
        screen
          .getAllByRole('textbox')
          .map((input) => input.getAttribute('aria-label')),
      ).toEqual(['Hours', 'Minutes', 'Seconds']);
    });
  });

  describe('when a single digit is entered', () => {
    it('pads it to two digits on leaving the input', async () => {
      const user = userEvent.setup();
      render(
        <DurationField label="Length" name="length" durationFormat="mm:ss" />,
      );
      const seconds = screen.getByRole('textbox', { name: 'Seconds' });

      await user.type(seconds, '6');
      await user.tab();

      expect(seconds).toHaveValue('06');
    });
  });
});
