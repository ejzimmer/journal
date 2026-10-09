import { useEffect, useSyncExternalStore } from 'react';
import { getWaitingRegistration, subscribe } from './appUpdateStore';
import { RestartArrowIcon } from './icons/RestartArrow';
import './AppUpdateButton.css';

export function AppUpdateButton() {
  const waitingRegistration = useSyncExternalStore(
    subscribe,
    getWaitingRegistration,
  );

  useEffect(() => {
    if (!waitingRegistration) return;

    const reload = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', reload);
    return () =>
      navigator.serviceWorker.removeEventListener('controllerchange', reload);
  }, [waitingRegistration]);

  if (!waitingRegistration) return null;

  return (
    <button
      className="app-update-button"
      aria-label="Update to the new version"
      onClick={() =>
        waitingRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      }
    >
      <RestartArrowIcon />
    </button>
  );
}
