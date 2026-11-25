import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ArrowSwitch } from './ArrowSwitch';

describe('ArrowSwitch', () => {
  describe('when it is off', () => {
    it('is unchecked', () => {
      render(<ArrowSwitch label="Lights" isOn={false} onClick={jest.fn()} />);

      expect(screen.getByRole('switch', { name: 'Lights' })).not.toBeChecked();
    });
  });

  describe('when it is on', () => {
    it('is checked', () => {
      render(<ArrowSwitch label="Lights" isOn onClick={jest.fn()} />);

      expect(screen.getByRole('switch', { name: 'Lights' })).toBeChecked();
    });
  });

  describe('when the user clicks it', () => {
    it('calls onClick', async () => {
      const onClick = jest.fn();
      render(<ArrowSwitch label="Lights" isOn={false} onClick={onClick} />);

      await userEvent.click(screen.getByRole('switch', { name: 'Lights' }));

      expect(onClick).toHaveBeenCalled();
    });
  });

  describe('when it is disabled', () => {
    it('is disabled', () => {
      render(
        <ArrowSwitch
          label="Lights"
          isOn={false}
          isDisabled
          onClick={jest.fn()}
        />,
      );

      expect(screen.getByRole('switch', { name: 'Lights' })).toBeDisabled();
    });
  });
});
