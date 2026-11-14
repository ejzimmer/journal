import { act, render, screen } from '@testing-library/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { AuthGate } from './AuthGate';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
}));
jest.mock('./loading', () => ({ Loading: () => null }));

const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;

function GatedApp() {
  return (
    <AuthGate>
      <main />
    </AuthGate>
  );
}

function renderGatedApp() {
  const unsubscribe = jest.fn();
  let reportUser: (user: User | null) => void = () => {};
  mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
    reportUser = callback;
    return unsubscribe;
  });

  const view = render(<GatedApp />);
  return {
    ...view,
    unsubscribe,
    reportUser: (user: User | null) => act(() => reportUser(user)),
  };
}

describe('AuthGate', () => {
  describe('the auth state listener', () => {
    it('is registered once, however many times the gate renders', () => {
      const { rerender, reportUser } = renderGatedApp();

      reportUser(null);
      rerender(<GatedApp />);

      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    });

    it('is removed when the gate unmounts', () => {
      const { unmount, unsubscribe } = renderGatedApp();

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('when auth reports no user', () => {
    it('offers a login button', () => {
      const { reportUser } = renderGatedApp();

      reportUser(null);

      expect(
        screen.getByRole('button', { name: 'Log In' }),
      ).toBeInTheDocument();
    });
  });

  describe('when auth reports a user', () => {
    it('shows its children', () => {
      const { reportUser } = renderGatedApp();

      reportUser({} as User);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
