import {
  ComponentType,
  CSSProperties,
  KeyboardEvent,
  useEffect,
  useRef,
} from 'react';
import { DraggableListItem } from '../../shared/drag-and-drop/DraggableListItem';
import {
  Destination,
  draggableTypeKey,
} from '../../shared/drag-and-drop/types';
import { MediaDetails } from './types';
import { useMediaStorage } from './MediaStorageContext';
import { Spine } from './Spine';
import { getNextStatus } from './nextStatus';
import { useFormToggle } from '../../shared/controls/useFormToggle';

export type MediaEditFormProps<T extends MediaDetails> = {
  item: T;
  isOpen: boolean;
  onCancel: () => void;
};

export type StatusConfig<T extends MediaDetails, S extends string> = {
  order: readonly S[];
  spineStatus: Record<S, 'todo' | 'active' | 'done'>;
  glyph: Record<S, string>;
  getStatus: (item: T) => S;
  setStatus: (item: T, status: S) => T;
  getAuthor?: (item: T) => string | undefined;
};

const SPINE_DRAGGABLE_TYPE = 'spine';

const MOVE_KEYS = 'ArrowLeft ArrowRight Shift+ArrowLeft Shift+ArrowRight';

function getMoveDestination(
  event: KeyboardEvent,
  isFirst: boolean,
  isLast: boolean,
): Destination | undefined {
  if (event.key === 'ArrowLeft' && !isFirst) {
    return event.shiftKey ? 'start' : 'previous';
  }
  if (event.key === 'ArrowRight' && !isLast) {
    return event.shiftKey ? 'end' : 'next';
  }
}

function getSpineHeight(title: string) {
  return 178 + Math.min(34, Math.round(title.length * 1.5));
}

export function MediaSpine<T extends MediaDetails, S extends string>({
  item,
  bandHue,
  hue,
  config,
  EditForm,
  listId,
  isFirst,
  isLast,
  onMove,
}: {
  item: T;
  bandHue?: number;
  hue: number;
  config: StatusConfig<T, S>;
  EditForm: ComponentType<MediaEditFormProps<T>>;
  listId?: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (destination: Destination) => void;
}) {
  const { updateMedia } = useMediaStorage();
  const { isFormOpen, triggerRef, openForm, closeForm } = useFormToggle();
  const refocusAfterMoveRef = useRef(false);

  useEffect(() => {
    if (!refocusAfterMoveRef.current) return;
    refocusAfterMoveRef.current = false;
    triggerRef.current?.focus();
  });

  const moveOnArrowKey = (event: KeyboardEvent) => {
    if (!listId) return;
    const destination = getMoveDestination(event, isFirst, isLast);
    if (!destination) return;

    event.preventDefault();
    refocusAfterMoveRef.current = true;
    onMove(destination);
  };

  const status = config.getStatus(item);
  const nextStatus = getNextStatus(config.order, status);
  const author = config.getAuthor?.(item);

  const updateStatus = () => {
    updateMedia(config.setStatus(item, nextStatus));
  };

  const spine = (
    <Spine
      status={config.spineStatus[status]}
      hue={hue}
      bandHue={bandHue}
      minHeight={getSpineHeight(item.title)}
      title={item.title}
      author={author}
      glyph={config.glyph[status]}
      titleAriaLabel={`${item.title}${author ? `, ${author}` : ''}, ${status}`}
      stampAriaLabel={`${item.title}: ${status}. Change to ${nextStatus}`}
      titleRef={triggerRef}
      onTitleClick={openForm}
      onStampClick={updateStatus}
      onTitleKeyDown={moveOnArrowKey}
      titleKeyShortcuts={listId && MOVE_KEYS}
    />
  );
  const editForm = (
    <EditForm item={item} isOpen={isFormOpen} onCancel={closeForm} />
  );

  if (!listId) {
    return (
      <li className="spine-item">
        {spine}
        {editForm}
      </li>
    );
  }

  return (
    <DraggableListItem
      className="spine-item"
      getData={() => ({
        [draggableTypeKey]: SPINE_DRAGGABLE_TYPE,
        id: item.id,
        parentId: listId,
      })}
      isDroppable={(data) =>
        data[draggableTypeKey] === SPINE_DRAGGABLE_TYPE &&
        data.parentId === listId
      }
      allowedEdges={['left', 'right']}
      dragHandle={spine}
      dragPreview={<SpineDragPreview title={item.title} hue={hue} />}
    >
      {editForm}
    </DraggableListItem>
  );
}

function SpineDragPreview({ title, hue }: { title: string; hue: number }) {
  return (
    <div
      className="spine-drag-preview"
      style={{ '--hue': hue } as CSSProperties}
    >
      {title}
    </div>
  );
}
