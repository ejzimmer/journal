import { countSignposts } from './signposts';

export function Signpost({ name }: { name: string }) {
  const posts = countSignposts(name);

  return (
    <div className="signpost">
      <div className="sign-board">{name}</div>
      <div className="sign-posts">
        {Array.from({ length: posts }, (_, index) => (
          <div key={index} className="sign-post" />
        ))}
      </div>
    </div>
  );
}
