import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import { ReactNode, useEffect, useState } from 'react';

import { Loading } from './loading';
import './AuthGate.css';

type AuthGateProps = {
  children: ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);
  const auth = getAuth();

  useEffect(
    () =>
      onAuthStateChanged(auth, (user) => {
        setIsLoading(false);
        setLoggedIn(!!user);
      }),
    [auth],
  );

  const logIn = () => {
    signInWithPopup(auth, new GoogleAuthProvider());
  };

  if (isLoading) {
    return (
      <div className="auth-gate-loading">
        <Loading />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="not-logged-in">
        <button onClick={logIn}>Log In</button>
      </div>
    );
  }

  return children;
}
