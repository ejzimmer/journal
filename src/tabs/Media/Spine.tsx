import {
  CSSProperties,
  KeyboardEventHandler,
  ReactNode,
  RefObject,
} from 'react';
import { DraggableListItem } from '../../shared/drag-and-drop/DraggableListItem';
import { draggableTypeKey } from '../../shared/drag-and-drop/types';

import './Spine.css';

const SPINE_DRAGGABLE_TYPE = 'spine';

export function Spine({
  itemId,
  dragListId,
  status,
  hue,
  bandHue,
  minHeight,
  title,
  author,
  glyph,
  titleAriaLabel,
  stampAriaLabel,
  titleRef,
  onTitleClick,
  onStampClick,
  onTitleKeyDown,
  titleKeyShortcuts,
  children,
}: {
  itemId: string;
  dragListId?: string;
  status: 'todo' | 'active' | 'done';
  hue: number;
  bandHue?: number;
  minHeight: number;
  title: string;
  author?: string;
  glyph: string;
  titleAriaLabel: string;
  stampAriaLabel: string;
  titleRef?: RefObject<HTMLButtonElement | null>;
  onTitleClick: () => void;
  onStampClick: () => void;
  onTitleKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  titleKeyShortcuts?: string;
  children?: ReactNode;
}) {
  const className = `spine ${status}`;
  const style = {
    '--hue': hue,
    ...(bandHue !== undefined && { '--band-hue': bandHue }),
    minHeight,
  } as CSSProperties;

  const titleButton = (
    <button
      ref={titleRef}
      className="title"
      aria-label={titleAriaLabel}
      aria-keyshortcuts={titleKeyShortcuts}
      onClick={onTitleClick}
      onKeyDown={onTitleKeyDown}
    >
      <span className="spine-label">
        <span className="title-text">{title}</span>
        {author && <span className="author">{author}</span>}
      </span>
    </button>
  );

  const decorations = (
    <>
      {bandHue !== undefined && (
        <span className="series-band series-band-head" />
      )}

      <button
        className="stamp"
        aria-label={stampAriaLabel}
        onClick={onStampClick}
      >
        {glyph}
      </button>

      {bandHue !== undefined && (
        <span className="series-band series-band-tail" />
      )}

      {children}
    </>
  );

  if (!dragListId) {
    return (
      <li className={className} style={style}>
        {titleButton}
        {decorations}
      </li>
    );
  }

  return (
    <DraggableListItem
      className={className}
      style={style}
      getData={() => ({
        [draggableTypeKey]: SPINE_DRAGGABLE_TYPE,
        id: itemId,
        parentId: dragListId,
      })}
      isDroppable={(data) =>
        data[draggableTypeKey] === SPINE_DRAGGABLE_TYPE &&
        data.parentId === dragListId
      }
      allowedEdges={['left', 'right']}
      dragHandle={titleButton}
      dragPreview={
        <div className="spine-drag-preview" style={style}>
          {title}
        </div>
      }
    >
      {decorations}
    </DraggableListItem>
  );
}
