import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LatchButton } from './LatchButton';

describe('LatchButton', () => {
  describe('when it is popped out', () => {
    it('is not pressed', () => {
      render(
        <LatchButton label="Hold" isPressed={false} onClick={jest.fn()}>
          ⏸
        </LatchButton>,
      );

      expect(screen.getByRole('button', { name: 'Hold' })).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });
  });

  describe('when it is pushed in', () => {
    it('is pressed', () => {
      render(
        <LatchButton label="Hold" isPressed onClick={jest.fn()}>
          ⏸
        </LatchButton>,
      );

      expect(screen.getByRole('button', { name: 'Hold' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  });

  describe('when the user clicks it', () => {
    it('calls onClick', async () => {
      const onClick = jest.fn();
      render(
        <LatchButton label="Hold" isPressed={false} onClick={onClick}>
          ⏸
        </LatchButton>,
      );

      await userEvent.click(screen.getByRole('button', { name: 'Hold' }));

      expect(onClick).toHaveBeenCalled();
    });
  });
});
