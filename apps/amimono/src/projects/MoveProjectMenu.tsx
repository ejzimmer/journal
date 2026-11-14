import { CSSProperties, useId, useRef } from 'react';

import './MoveProjectMenu.css';
import { MoveArrowsIcon } from '../icons/MoveArrowsIcon';
import { ListWireframeButton } from './ListWireframeButton';
import { ListKey } from './types';

type MoveProjectMenuProps = {
  currentList: ListKey;
  onMove: (targetList: ListKey) => void;
};

export function MoveProjectMenu({ currentList, onMove }: MoveProjectMenuProps) {
  const id = useId();
  const popoverRef = useRef<HTMLDivElement>(null);
  const anchorName = `--move-anchor-${id.replace(/[^a-zA-Z0-9]/g, '')}`;

  const moveTo = (targetList: ListKey) => {
    popoverRef.current?.hidePopover();
    onMove(targetList);
  };

  return (
    <>
      <button
        className="card-control"
        popoverTarget={id}
        aria-label="Move to another list"
        title="Move to another list"
        style={{ anchorName } as CSSProperties}
      >
        <MoveArrowsIcon />
      </button>
      <div
        id={id}
        ref={popoverRef}
        className="move-project-menu"
        popover="auto"
        role="group"
        aria-label="Move to list"
        style={{ positionAnchor: anchorName } as CSSProperties}
      >
        <div className="queue-wireframes">
          <ListWireframeButton
            listKey="meetings"
            currentList={currentList}
            onMove={moveTo}
          />
          <ListWireframeButton
            listKey="concentration"
            currentList={currentList}
            onMove={moveTo}
          />
        </div>
        <ListWireframeButton
          listKey="future"
          currentList={currentList}
          onMove={moveTo}
        />
      </div>
    </>
  );
}
