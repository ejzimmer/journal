import {
  CSSProperties,
  KeyboardEventHandler,
  ReactNode,
  RefObject,
} from 'react';
import { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';

import './Spine.css';

export function Spine({
  spineRef,
  isDragging,
  dropEdge,
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
  spineRef?: RefObject<HTMLLIElement | null>;
  isDragging?: boolean;
  dropEdge?: Edge | null;
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
  return (
    <li
      ref={spineRef}
      className={`spine ${status}${isDragging ? ' dragging' : ''}`}
      style={
        {
          '--hue': hue,
          ...(bandHue !== undefined && { '--band-hue': bandHue }),
          minHeight,
        } as CSSProperties
      }
    >
      {bandHue !== undefined && (
        <span className="series-band series-band-head" />
      )}

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

      {dropEdge && <span className={`spine-drop-indicator ${dropEdge}`} />}

      {children}
    </li>
  );
}
