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
          <h2 className="conflict-heading">Resolve conflicts</h2>
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
  const title = describeItem(conflict);
  const field = describeField(conflict.path);
  const [mine, theirs] = splitChangedWords(
    describeValue(conflict.mine),
    describeValue(conflict.theirs),
  );

  return (
    <li className="conflict" aria-label={title}>
      <div className="conflict-title">
        <span>{title}</span>
        {field && <span className="conflict-field">{field}</span>}
      </div>
      <ConflictSide
        className="mine"
        label="Your change"
        words={mine}
        onKeep={() => conflictStatus.keepMine(conflict.path)}
      />
      <ConflictSide
        className="theirs"
        label="Incoming change"
        words={theirs}
        onKeep={() => conflictStatus.keepTheirs(conflict.path)}
      />
    </li>
  );
}

function ConflictSide({
  className,
  label,
  words,
  onKeep,
}: {
  className: string;
  label: string;
  words: ChangedWords;
  onKeep: () => void;
}) {
  return (
    <div className={`conflict-side ${className}`}>
      <div className="conflict-side-header">
        <span>{label}</span>
        <button
          className="conflict-keep"
          aria-label={`Keep ${label.toLowerCase()}`}
          onClick={onKeep}
        >
          Keep this
        </button>
      </div>
      <div className="conflict-value">
        {words.before}
        {words.changed && <mark>{words.changed}</mark>}
        {words.after}
      </div>
    </div>
  );
}

type ChangedWords = { before: string; changed: string; after: string };

function splitChangedWords(
  mine: string,
  theirs: string,
): [ChangedWords, ChangedWords] {
  const mineWords = mine.split(/(\s+)/);
  const theirWords = theirs.split(/(\s+)/);
  let start = 0;
  while (
    start < mineWords.length &&
    start < theirWords.length &&
    mineWords[start] === theirWords[start]
  ) {
    start++;
  }
  let end = 0;
  while (
    end < mineWords.length - start &&
    end < theirWords.length - start &&
    mineWords[mineWords.length - 1 - end] ===
      theirWords[theirWords.length - 1 - end]
  ) {
    end++;
  }
  if (start === 0 && end === 0) {
    return [
      { before: mine, changed: '', after: '' },
      { before: theirs, changed: '', after: '' },
    ];
  }
  const splitWords = (words: string[]) => {
    const changed = words.slice(start, words.length - end).join('');
    const leadingSpace = changed.match(/^\s*/)?.[0] ?? '';
    return {
      before: words.slice(0, start).join('') + leadingSpace,
      changed: changed.slice(leadingSpace.length),
      after: words.slice(words.length - end).join(''),
    };
  };
  return [splitWords(mineWords), splitWords(theirWords)];
}

function describeItem({ path, item, mine, theirs }: Conflict): string {
  const name = findName(item) ?? findName(mine) ?? findName(theirs);
  return name ?? capitalise(listReadableSegments(path)[0] ?? '');
}

function describeField(path: string): string | undefined {
  const segments = path.split('/');
  const last = segments[segments.length - 1];
  if (ID_SEGMENT.test(last) || segments.length <= 3) return undefined;
  return capitalise(last.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase());
}

function describeValue(value: unknown): string {
  if (value === null || value === undefined) return 'Deleted';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value !== 'object') return String(value);
  return 'Edited';
}

function findName(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const record = value as Record<string, unknown>;
  const field = NAME_FIELDS.find((key) => typeof record[key] === 'string');
  return field && (record[field] as string);
}

function listReadableSegments(path: string): string[] {
  return path
    .slice(V2_ROOT.length + 1)
    .split('/')
    .filter((segment) => !ID_SEGMENT.test(segment));
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
