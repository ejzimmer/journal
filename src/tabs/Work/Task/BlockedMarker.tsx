import { RubbishBinIcon } from '../../../shared/icons/RubbishBin';
import { Blocker, BLOCKERS } from '../types';
import { Stamp } from './Stamp';
import { StampMenu, StampMenuOption } from './StampMenu';

const BLOCKER_LABELS: Record<Blocker, string> = {
  merge_queue: 'Blocked on merge queue',
  build: 'Blocked on build',
  human: 'Blocked on human',
  time: 'Blocked on time',
};

type BlockedMarkerProps = {
  blockedOn?: Blocker;
  onChange: (blockedOn?: Blocker) => void;
};

export function BlockedMarker({ blockedOn, onChange }: BlockedMarkerProps) {
  const blockerOptions = BLOCKERS.filter(
    (blocker) => blocker !== blockedOn,
  ).map((blocker): StampMenuOption => ({
    key: blocker,
    label: BLOCKER_LABELS[blocker],
    content: <Stamp blocker={blocker} />,
    onSelect: () => onChange(blocker),
  }));

  const options: StampMenuOption[] = blockedOn
    ? [
        ...blockerOptions,
        {
          key: 'remove',
          label: 'Unblock',
          className: 'remove',
          content: <RubbishBinIcon width="18px" colour="currentColor" />,
          onSelect: () => onChange(undefined),
        },
      ]
    : blockerOptions;

  return (
    <div className="blocked-marker">
      <StampMenu
        trigger={(props) => (
          <button
            {...props}
            className={`${props.className} ${blockedOn ? '' : 'add-metadata'}`}
            aria-label={
              blockedOn ? BLOCKER_LABELS[blockedOn] : 'Mark as blocked'
            }
          >
            <Stamp blocker={blockedOn} />
          </button>
        )}
        options={options}
      />
    </div>
  );
}
