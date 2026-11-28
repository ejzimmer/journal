import { BallShape } from './BallShape';

type BallIconProps = {
  colour: string;
};

export function BallIcon({ colour }: BallIconProps) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <BallShape colour={colour} />
    </svg>
  );
}
