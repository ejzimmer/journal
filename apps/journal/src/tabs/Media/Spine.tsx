import { CSSProperties, KeyboardEventHandler, RefObject } from 'react';

import './Spine.css';

export type SpineAppearance = {
  status: 'todo' | 'active' | 'done';
  hue: number;
  bandHue?: number;
  minHeight: number;
  title: string;
  author?: string;
  glyph: string;
};

type SpineProps = SpineAppearance & {
  titleAriaLabel: string;
  statusAriaLabel: string;
  titleRef?: RefObject<HTMLButtonElement | null>;
  onTitleClick: () => void;
  onStatusClick?: () => void;
  statusPopoverTarget?: string;
  statusAnchorName?: string;
  onTitleKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  titleKeyShortcuts?: string;
};

export function Spine({
  status,
  hue,
  bandHue,
  minHeight,
  title,
  author,
  glyph,
  titleAriaLabel,
  statusAriaLabel,
  titleRef,
  onTitleClick,
  onStatusClick,
  statusPopoverTarget,
  statusAnchorName,
  onTitleKeyDown,
  titleKeyShortcuts,
}: SpineProps) {
  return (
    <div
      className={`spine ${status}`}
      style={
        { '--hue': hue, '--band-hue': bandHue, minHeight } as CSSProperties
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
        className="status"
        aria-label={statusAriaLabel}
        popoverTarget={statusPopoverTarget}
        style={{ anchorName: statusAnchorName } as CSSProperties}
        onClick={onStatusClick}
      >
        {glyph}
      </button>

      {bandHue !== undefined && (
        <span className="series-band series-band-tail" />
      )}
    </div>
  );
}
