import { CSSProperties } from 'react';
import { SignpostPlacement } from './findSignpostPlacement';
import { countSignposts } from './signposts';

type SignpostProps = {
  name: string;
  placement: SignpostPlacement;
  isOpen: boolean;
  onClick: () => void;
};

export function Signpost({ name, placement, isOpen, onClick }: SignpostProps) {
  const posts = countSignposts(name);

  return (
    <div
      className={`signpost on-${placement.side}`}
      style={{ '--sign-offset': `${placement.offset}px` } as CSSProperties}
    >
      <button
        type="button"
        className="sign-board"
        aria-expanded={isOpen}
        onClick={onClick}
      >
        {name}
      </button>
      <div className="sign-posts">
        {Array.from({ length: posts }, (_, index) => (
          <div key={index} className="sign-post" />
        ))}
      </div>
    </div>
  );
}
