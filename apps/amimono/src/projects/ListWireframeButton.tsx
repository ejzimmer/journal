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
  const label = LIST_LABELS[listKey];
  const barCount = listKey === 'future' ? 4 : 3;

  return (
    <button
      className={`list-wireframe ${listKey}${isCurrent ? ' current' : ''}`}
      aria-label={isCurrent ? `${label} (current list)` : `Move to ${label}`}
      disabled={isCurrent}
      onClick={() => onMove(listKey)}
    >
      {Array.from({ length: barCount }, (_, index) => (
        <span key={index} />
      ))}
    </button>
  );
}
