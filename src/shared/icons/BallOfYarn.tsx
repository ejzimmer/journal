import { useId } from 'react';
import { IconProps } from './types';

export function BallOfYarnIcon({
  width = '100%',
  colour = 'currentColor',
}: IconProps) {
  const id = useId();
  const strandClip = `${id}-strands`;
  const shading = `${id}-shading`;

  return (
    <svg viewBox="0 0 20 20" width={width}>
      <defs>
        <clipPath id={strandClip}>
          <circle cx="10" cy="10" r="8" />
        </clipPath>
        <radialGradient id={shading} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <path
        d="M13.8 14.6 C16.4 16.4 17.2 15.6 18.2 16.8 C19.2 18 18.2 19.4 17 18.8 C16.2 18.4 16.4 17.4 17.4 17.4"
        fill="none"
        stroke={colour}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="8" fill={colour} />
      <g
        clipPath={`url(#${strandClip})`}
        fill="none"
        stroke="black"
        strokeOpacity="0.3"
        strokeWidth="0.8"
      >
        <ellipse cx="10" cy="10" rx="8" ry="2.6" transform="rotate(42 10 10)" />
        <ellipse
          cx="10"
          cy="10"
          rx="8"
          ry="2.6"
          transform="rotate(-42 10 10)"
        />
        <ellipse cx="10" cy="10" rx="8" ry="5.6" />
      </g>
      <circle cx="10" cy="10" r="8" fill={`url(#${shading})`} />
    </svg>
  );
}
