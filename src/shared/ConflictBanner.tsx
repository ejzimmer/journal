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
          ? '1 conflict while uploading'
          : `${conflicts.length} conflicts while uploading`}
      </span>
      <Modal
        trigger={(props) => (
          <button className="primary" {...props}>
            Resolve
          </button>
        )}
      >
        <Modal.Body>
          <h2 className="conflict-heading">Local changes</h2>
          <ul className="conflict-list">
            {conflicts.map((conflict) => (
              <ConflictChoice
                key={conflict.path}
                conflict={conflict}
                conflictStatus={conflictStatus}
              />
            ))}
          </ul>
          {conflicts.length > 1 && (
            <ChangeChoices
              className="keep-all"
              discardLabel="Discard all"
              keepLabel="Keep all"
              onDiscard={() =>
                conflicts.forEach(({ path }) => conflictStatus.keepTheirs(path))
              }
              onKeep={() =>
                conflicts.forEach(({ path }) => conflictStatus.keepMine(path))
              }
            />
          )}
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
  const caption = describeConflict(conflict);
  const note = describeDeletion(conflict);

  return (
    <li className="conflict" aria-label={caption}>
      <div className="conflict-caption">{caption}</div>
      <div className="conflict-diff">
        {getDiffParts(
          describeValue(conflict.theirs),
          describeValue(conflict.mine),
        ).map(({ text, kind }, index) =>
          kind === 'removed' ? (
            <del key={index}>{text}</del>
          ) : kind === 'added' ? (
            <ins key={index}>{text}</ins>
          ) : (
            text
          ),
        )}
      </div>
      {note && <div className="conflict-note">{note}</div>}
      <ChangeChoices
        discardLabel="Discard"
        keepLabel="Keep"
        onDiscard={() => conflictStatus.keepTheirs(conflict.path)}
        onKeep={() => conflictStatus.keepMine(conflict.path)}
      />
    </li>
  );
}

function ChangeChoices({
  className = '',
  discardLabel,
  keepLabel,
  onDiscard,
  onKeep,
}: {
  className?: string;
  discardLabel: string;
  keepLabel: string;
  onDiscard: () => void;
  onKeep: () => void;
}) {
  return (
    <div className={`conflict-actions ${className}`}>
      <button className="default" onClick={onDiscard}>
        {discardLabel}
      </button>
      <span aria-hidden="true">|</span>
      <button onClick={onKeep}>{keepLabel}</button>
    </div>
  );
}

type DiffPart = { text: string; kind: 'same' | 'removed' | 'added' };

function getDiffParts(original: string, changed: string): DiffPart[] {
  const originalWords = original.split(/(\s+)/);
  const changedWords = changed.split(/(\s+)/);
  let start = 0;
  while (
    start < originalWords.length &&
    start < changedWords.length &&
    originalWords[start] === changedWords[start]
  ) {
    start++;
  }
  let end = 0;
  while (
    end < originalWords.length - start &&
    end < changedWords.length - start &&
    originalWords[originalWords.length - 1 - end] ===
      changedWords[changedWords.length - 1 - end]
  ) {
    end++;
  }
  const removed = originalWords
    .slice(start, originalWords.length - end)
    .join('');
  const added = changedWords.slice(start, changedWords.length - end).join('');
  const changedText = removed || added;
  const leadingSpace = changedText.match(/^\s*/)?.[0] ?? '';
  const trailingSpace = changedText.match(/\s*$/)?.[0] ?? '';
  const parts: DiffPart[] = [
    {
      text: originalWords.slice(0, start).join('') + leadingSpace,
      kind: 'same',
    },
    { text: removed.trim(), kind: 'removed' },
    { text: removed.trim() && added.trim() ? ' ' : '', kind: 'same' },
    { text: added.trim(), kind: 'added' },
    {
      text:
        trailingSpace +
        originalWords.slice(originalWords.length - end).join(''),
      kind: 'same',
    },
  ];
  return parts.filter(({ text }) => text !== '');
}

function describeConflict(conflict: Conflict): string {
  const field = describeField(conflict.path);
  const itemName = findName(conflict.item);
  if (!field) return describeSection(conflict.path);
  if (!itemName || isNameField(conflict.path)) return field;
  return `${field} · ${itemName}`;
}

function describeDeletion({ mine, theirs }: Conflict): string | undefined {
  if (theirs === null) return 'Deleted on the other device';
  if (mine === null) return 'Deleted on this device';
  return undefined;
}

function describeSection(path: string): string {
  return capitalise(getReadableSegments(path)[0] ?? '');
}

function isNameField(path: string): boolean {
  return NAME_FIELDS.includes(path.split('/').pop() ?? '');
}

function describeField(path: string): string | undefined {
  const segments = path.split('/');
  const last = segments[segments.length - 1];
  if (ID_SEGMENT.test(last) || segments.length <= 3) return undefined;
  return capitalise(last.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase());
}

function describeValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value !== 'object') return String(value);
  return findName(value) ?? 'Edited';
}

function findName(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const record = value as Record<string, unknown>;
  const field = NAME_FIELDS.find((key) => typeof record[key] === 'string');
  return field && (record[field] as string);
}

function getReadableSegments(path: string): string[] {
  return path
    .slice(V2_ROOT.length + 1)
    .split('/')
    .filter((segment) => !ID_SEGMENT.test(segment));
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
