import { useId } from 'react';

import { BallShape } from './BallShape';

type HalfBallIconProps = {
  colour: string;
};

export function HalfBallIcon({ colour }: HalfBallIconProps) {
  const halfId = `${useId().replace(/[^\w-]/g, '')}-half`;

  return (
    <svg viewBox="0 0 20 20" aria-hidden>
      <defs>
        <clipPath id={halfId}>
          <rect x="0" y="0" width="10" height="20" />
        </clipPath>
      </defs>
      <g opacity=".25">
        <BallShape colour={colour} />
      </g>
      <g clipPath={`url(#${halfId})`}>
        <BallShape colour={colour} />
      </g>
    </svg>
  );
}
