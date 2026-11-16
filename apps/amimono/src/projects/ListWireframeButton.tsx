import { LIST_LABELS } from './projectTypes';
import { ListKey } from './types';

type ListWireframeButtonProps = {
  listKey: ListKey;
  currentList: ListKey;
  onMove: (listKey: ListKey) => void;
};

export function ListWireframeButton({
  listKey,
  currentList,
  onMove,
}: ListWireframeButtonProps) {
  const isCurrent = listKey === currentList;
  const canMoveToTop = isCurrent && listKey !== 'future';
  const label = LIST_LABELS[listKey];
  const barCount = listKey === 'future' ? 4 : 3;

  function createAriaLabel() {
    if (canMoveToTop) return `Move to top of ${label}`;
    if (isCurrent) return `${label} (current list)`;
    return `Move to ${label}`;
  }

  return (
    <button
      className={`list-wireframe ${listKey}${isCurrent ? ' current' : ''}`}
      aria-label={createAriaLabel()}
      disabled={isCurrent && !canMoveToTop}
      onClick={() => onMove(listKey)}
    >
      {Array.from({ length: barCount }, (_, index) => (
        <span key={index} />
      ))}
    </button>
  );
}
