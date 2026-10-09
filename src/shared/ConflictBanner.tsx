import { useSyncExternalStore } from 'react';
import { ConflictStatus } from './localFirst/createLocalFirstContext';
import { Conflict } from './localFirst/editTimes';
import { V2_ROOT } from './localFirst/v2Shape';
import { Modal } from './controls/Modal';
import './AppUpdateBanner.css';
import './ConflictBanner.css';

const ID_SEGMENT =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NAME_FIELDS = ['description', 'name', 'title', 'label'];

export function ConflictBanner({
  conflictStatus,
}: {
  conflictStatus: ConflictStatus;
}) {
  const conflicts = useSyncExternalStore(
    conflictStatus.subscribe,
    conflictStatus.listConflicts,
  );

  if (conflicts.length === 0) return null;

  return (
    <div className="app-update-banner conflict-banner" role="alert">
      <span>
        {conflicts.length === 1
          ? '1 change clashed with another device.'
          : `${conflicts.length} changes clashed with another device.`}
      </span>
      <Modal
        trigger={(props) => (
          <button className="primary" {...props}>
            Review
          </button>
        )}
      >
        <Modal.Body>
          <h2 className="conflict-heading">Pick which version to keep</h2>
          <ul className="conflict-list">
            {conflicts.map((conflict) => (
              <ConflictChoice
                key={conflict.path}
                conflict={conflict}
                conflictStatus={conflictStatus}
              />
            ))}
          </ul>
        </Modal.Body>
      </Modal>
    </div>
  );
}

function ConflictChoice({
  conflict,
  conflictStatus,
}: {
  conflict: Conflict;
  conflictStatus: ConflictStatus;
}) {
  const label = describePath(conflict.path);

  return (
    <li className="conflict-choice" aria-label={label}>
      <div className="conflict-label">{label}</div>
      <dl className="conflict-versions">
        <dt>Yours</dt>
        <dd>{describeValue(conflict.mine)}</dd>
        <dt>Other device</dt>
        <dd>{describeValue(conflict.theirs)}</dd>
      </dl>
      <div className="conflict-actions">
        <button
          className="outline"
          onClick={() => conflictStatus.keepTheirs(conflict.path)}
        >
          Keep other device's
        </button>
        <button
          className="primary"
          onClick={() => conflictStatus.keepMine(conflict.path)}
        >
          Keep mine
        </button>
      </div>
    </li>
  );
}

function describePath(path: string): string {
  return path
    .slice(V2_ROOT.length + 1)
    .split('/')
    .filter((segment) => !ID_SEGMENT.test(segment))
    .join(' › ');
}

function describeValue(value: unknown): string {
  if (value === null || value === undefined) return 'Deleted';
  if (typeof value !== 'object') return String(value);
  const nameField = NAME_FIELDS.find(
    (field) => typeof (value as Record<string, unknown>)[field] === 'string',
  );
  return nameField
    ? String((value as Record<string, unknown>)[nameField])
    : JSON.stringify(value);
}
