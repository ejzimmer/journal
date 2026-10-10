import { RefObject, useEffect, useRef, useSyncExternalStore } from 'react';
import { getWaitingRegistration, subscribe } from './appUpdateStore';
import { RestartArrowIcon } from './icons/RestartArrow';
import { useIsOverlapping } from './useIsOverlapping';
import './AppUpdateButton.css';

export function AppUpdateButton({
  tabListRef,
}: {
  tabListRef: RefObject<HTMLUListElement | null>;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isOverlappingTabs = useIsOverlapping(buttonRef, tabListRef);
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
      ref={buttonRef}
      className={`app-update-button${isOverlappingTabs ? ' overlapping' : ''}`}
      aria-label="Update to the new version"
      onClick={() =>
        waitingRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' })
      }
    >
      <RestartArrowIcon />
    </button>
  );
}
