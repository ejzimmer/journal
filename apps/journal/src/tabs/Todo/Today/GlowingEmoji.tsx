import './GlowingEmoji.css';

type GlowingEmojiProps = {
  emoji: string;
};

export function GlowingEmoji({ emoji }: GlowingEmojiProps) {
  return (
    <span className="glowing-emoji">
      <span className="glow" aria-hidden="true">
        {emoji}
      </span>
      <span>{emoji}</span>
    </span>
  );
}
