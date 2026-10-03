import { countSignposts } from './signposts';

type SignpostProps = {
  name: string;
  isOpen: boolean;
  onClick: () => void;
};

export function Signpost({ name, isOpen, onClick }: SignpostProps) {
  const posts = countSignposts(name);

  return (
    <div className="signpost">
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
