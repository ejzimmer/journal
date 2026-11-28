import './SkeinBalls.css';
import { BallIcon } from './icons/BallIcon';
import { HalfBallIcon } from './icons/HalfBallIcon';

const DEFAULT_BALL_COLOUR = 'hsl(275 64% 73%)';

type SkeinBallsProps = {
  skeins: number;
  colour?: string;
};

export function SkeinBalls({
  skeins,
  colour = DEFAULT_BALL_COLOUR,
}: SkeinBallsProps) {
  const fullBallCount = Math.floor(skeins);
  const hasPartBall = skeins > fullBallCount;

  return (
    <span
      className="skein-balls"
      role="img"
      aria-label={`${skeins} ${skeins === 1 ? 'skein' : 'skeins'}`}
    >
      {Array.from({ length: fullBallCount }, (_, index) => (
        <BallIcon key={index} colour={colour} />
      ))}
      {hasPartBall && <HalfBallIcon colour={colour} />}
    </span>
  );
}
