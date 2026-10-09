import { useSyncExternalStore } from 'react';
import { OutdatedStatus } from './localFirst/createLocalFirstContext';
import './AppUpdateBanner.css';

export function OutdatedAppBanner({
  outdatedStatus,
}: {
  outdatedStatus: OutdatedStatus;
}) {
  const isOutdated = useSyncExternalStore(
    outdatedStatus.subscribe,
    outdatedStatus.getIsOutdated,
  );

  if (!isOutdated) return null;

  return (
    <div className="app-update-banner" role="alert">
      <span>This version can't save any more.</span>
      <button className="primary" onClick={() => window.location.reload()}>
        Reload
      </button>
    </div>
  );
}
