import { useId } from 'react';
import { IconProps } from './types';

export function BallOfYarnIcon({
  width = '100%',
  colour = 'currentColor',
}: IconProps) {
  const id = useId();
  const wrapClip = `${id}-wrap`;
  const shading = `${id}-shading`;

  return (
    <svg viewBox="0 0 20 20" width={width}>
      <defs>
        <clipPath id={wrapClip}>
          <circle cx="10" cy="10" r="8" />
        </clipPath>
        <radialGradient id={shading} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="45%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <path
        d="M12 16 C15 19 18 17.5 18.6 14.4"
        fill="none"
        stroke={colour}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10" r="8" fill={colour} />
      <g
        clipPath={`url(#${wrapClip})`}
        fill="none"
        stroke="black"
        strokeOpacity="0.26"
        strokeWidth="0.32"
      >
        <g transform="rotate(-76 10 10)">
          <path d="M-4 3.2 Q 10 2 24 3.2" />
          <path d="M-4 4.8 Q 10 3.6 24 4.8" />
          <path d="M-4 6.4 Q 10 5.2 24 6.4" />
          <path d="M-4 8 Q 10 6.8 24 8" />
          <path d="M-4 9.6 Q 10 8.4 24 9.6" />
          <path d="M-4 11.2 Q 10 10 24 11.2" />
          <path d="M-4 12.8 Q 10 11.6 24 12.8" />
          <path d="M-4 14.4 Q 10 13.2 24 14.4" />
          <path d="M-4 16 Q 10 14.8 24 16" />
          <path d="M-4 17.6 Q 10 16.4 24 17.6" />
        </g>
        <g transform="rotate(16 10 10)">
          <rect
            x="-4"
            y="2"
            width="28"
            height="9"
            fill={colour}
            stroke="none"
          />
          <path
            d="M-4 11.6 Q 10 10.4 24 11.6"
            strokeOpacity="0.5"
            strokeWidth="0.45"
          />
          <path d="M-4 4.2 Q 10 3 24 4.2" />
          <path d="M-4 5.8 Q 10 4.6 24 5.8" />
          <path d="M-4 7.4 Q 10 6.2 24 7.4" />
          <path d="M-4 9 Q 10 7.8 24 9" />
          <path d="M-4 10.6 Q 10 9.4 24 10.6" />
        </g>
        <g transform="rotate(-34 10 10)">
          <rect
            x="-4"
            y="6.4"
            width="28"
            height="9"
            fill={colour}
            stroke="none"
          />
          <path
            d="M-4 7 Q 10 5.8 24 7"
            strokeOpacity="0.5"
            strokeWidth="0.45"
          />
          <path
            d="M-4 16 Q 10 14.8 24 16"
            strokeOpacity="0.5"
            strokeWidth="0.45"
          />
          <path d="M-4 8.6 Q 10 7.4 24 8.6" />
          <path d="M-4 10.2 Q 10 9 24 10.2" />
          <path d="M-4 11.8 Q 10 10.6 24 11.8" />
          <path d="M-4 13.4 Q 10 12.2 24 13.4" />
          <path d="M-4 15 Q 10 13.8 24 15" />
        </g>
        <g transform="rotate(58 10 10)">
          <rect
            x="-4"
            y="10"
            width="28"
            height="7.5"
            fill={colour}
            stroke="none"
          />
          <path
            d="M-4 10.6 Q 10 9.4 24 10.6"
            strokeOpacity="0.5"
            strokeWidth="0.45"
          />
          <path
            d="M-4 18.1 Q 10 16.9 24 18.1"
            strokeOpacity="0.5"
            strokeWidth="0.45"
          />
          <path d="M-4 12.2 Q 10 11 24 12.2" />
          <path d="M-4 13.8 Q 10 12.6 24 13.8" />
          <path d="M-4 15.4 Q 10 14.2 24 15.4" />
          <path d="M-4 17 Q 10 15.8 24 17" />
        </g>
      </g>
      <circle cx="10" cy="10" r="8" fill={`url(#${shading})`} />
    </svg>
  );
}
