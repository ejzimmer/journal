import { useState } from 'react';
import { RubbishBinIcon } from '../../../shared/icons/RubbishBin';
import { Blocked, Blocker, BLOCKERS } from '../types';
import {
  BLOCKER_LABELS,
  describeBlocked,
  formatBlockedUntil,
} from './blockedLabels';
import { BlockedUntilForm } from './BlockedUntilForm';
import { Stamp } from './Stamp';
import { StampMenu, StampMenuOption } from './StampMenu';

type BlockedMarkerProps = {
  blocked?: Blocked;
  onChange: (blocked?: Blocked) => void;
};

export function BlockedMarker({ blocked, onChange }: BlockedMarkerProps) {
  const [isPickingTime, setIsPickingTime] = useState(false);

  const selectBlocker = (blocker: Blocker) => {
    if (blocker === 'time') {
      setIsPickingTime(true);
    } else {
      onChange({ on: blocker });
    }
  };

  const blockerOptions = BLOCKERS.filter(
    (blocker) => blocker !== blocked?.on || blocker === 'time',
  ).map((blocker): StampMenuOption => ({
    key: blocker,
    label: BLOCKER_LABELS[blocker],
    content: <Stamp blocker={blocker} />,
    onSelect: () => selectBlocker(blocker),
  }));

  const options: StampMenuOption[] = blocked
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

  const until = blocked?.on === 'time' ? blocked.until : undefined;

  return (
    <div className="blocked-marker">
      <StampMenu
        trigger={(props) => (
          <button
            {...props}
            className={`${props.className} ${blocked ? '' : 'add-metadata'}`}
            aria-label={blocked ? describeBlocked(blocked) : 'Mark as blocked'}
            title={until && formatBlockedUntil(until)}
          >
            <Stamp blocker={blocked?.on} />
          </button>
        )}
        options={options}
      />
      {isPickingTime && (
        <BlockedUntilForm
          until={until}
          onSubmit={(newUntil) => {
            onChange({ on: 'time', until: newUntil });
            setIsPickingTime(false);
          }}
          onCancel={() => setIsPickingTime(false)}
        />
      )}
    </div>
  );
}
