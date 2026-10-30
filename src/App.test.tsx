import { act, render, screen } from '@testing-library/react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { App } from './App';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  GoogleAuthProvider: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInWithPopup: jest.fn(),
}));
jest.mock('./shared/loading', () => ({ Loading: () => null }));
jest.mock('./TopNav', () => ({ TopNav: () => null }));
jest.mock('./AppRoutes', () => ({ AppRoutes: () => <main /> }));
jest.mock('./DailyJobs', () => ({ DailyJobs: () => null }));
jest.mock('./shared/dailyJobs/DailyJobsContext', () => ({
  DailyJobsProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;

function renderApp() {
  const unsubscribe = jest.fn();
  let reportUser: (user: User | null) => void = () => {};
  mockOnAuthStateChanged.mockImplementation((_auth, callback) => {
    reportUser = callback;
    return unsubscribe;
  });

  const view = render(<App />);
  return {
    ...view,
    unsubscribe,
    reportUser: (user: User | null) => act(() => reportUser(user)),
  };
}

describe('App', () => {
  describe('the auth state listener', () => {
    it('is registered once, however many times the app renders', () => {
      const { rerender, reportUser } = renderApp();

      reportUser(null);
      rerender(<App />);

      expect(mockOnAuthStateChanged).toHaveBeenCalledTimes(1);
    });

    it('is removed when the app unmounts', () => {
      const { unmount, unsubscribe } = renderApp();

      unmount();

      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('when auth reports no user', () => {
    it('offers a login button', () => {
      const { reportUser } = renderApp();

      reportUser(null);

      expect(
        screen.getByRole('button', { name: 'Log In' }),
      ).toBeInTheDocument();
    });
  });

  describe('when auth reports a user', () => {
    it('shows the app', () => {
      const { reportUser } = renderApp();

      reportUser({} as User);

      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });
});
