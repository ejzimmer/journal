import './SkeinBalls.css';
import ballIcon from './icons/ball.svg';
import halfBallIcon from './icons/ball-half.svg';

type SkeinBallsProps = {
  skeins: number;
};

export function SkeinBalls({ skeins }: SkeinBallsProps) {
  const fullBallCount = Math.floor(skeins);
  const hasPartBall = skeins > fullBallCount;

  return (
    <span
      className="skein-balls"
      role="img"
      aria-label={`${skeins} ${skeins === 1 ? 'skein' : 'skeins'}`}
    >
      {Array.from({ length: fullBallCount }, (_, index) => (
        <img key={index} src={ballIcon} alt="" />
      ))}
      {hasPartBall && <img src={halfBallIcon} alt="" />}
    </span>
  );
}
