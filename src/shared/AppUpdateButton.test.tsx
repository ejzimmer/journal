import { act, render, screen } from '@testing-library/react';
import { createRef } from 'react';
import userEvent from '@testing-library/user-event';
import { AppUpdateButton } from './AppUpdateButton';
import { setWaitingRegistration } from './appUpdateStore';

describe('AppUpdateButton', () => {
  describe('when a new version is waiting', () => {
    it('tells the new version to take over when clicked', async () => {
      const postMessage = jest.fn();
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: {
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
      });
      render(<AppUpdateButton tabListRef={createRef()} />);
      act(() =>
        setWaitingRegistration({
          waiting: { postMessage },
        } as unknown as ServiceWorkerRegistration),
      );

      await userEvent.click(
        screen.getByRole('button', { name: 'Update to the new version' }),
      );

      expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    });
  });
});
