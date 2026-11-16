import { act, screen } from '@testing-library/react';
import { setWaitingRegistration } from 'shared/appUpdateStore';

import { renderHomePage } from './homePageTestUtils';

describe('updating the app', () => {
  describe('when a new version is waiting', () => {
    it('offers to update to it', () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: {
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
        },
      });
      renderHomePage({});

      act(() =>
        setWaitingRegistration({
          waiting: { postMessage: jest.fn() },
        } as unknown as ServiceWorkerRegistration),
      );

      expect(
        screen.getByRole('button', { name: 'Update to the new version' }),
      ).toBeInTheDocument();
    });
  });
});
