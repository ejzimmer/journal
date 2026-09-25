import { useId } from 'react';
import { IconProps } from './types';
import {
  BALL_OUTLINE,
  BAND_EDGE,
  BANDS,
  darkenColour,
  SHADING,
  STRAND,
} from './ballOfYarnShape';

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
          <path d={BALL_OUTLINE} />
        </clipPath>
        <radialGradient
          id={shading}
          cx={SHADING.centreX}
          cy={SHADING.centreY}
          r={SHADING.radius}
        >
          {SHADING.stops.map(({ offset, rgb, opacity }) => (
            <stop
              key={offset}
              offset={offset}
              stopColor={`rgb(${rgb})`}
              stopOpacity={opacity}
            />
          ))}
        </radialGradient>
      </defs>
      <path d={BALL_OUTLINE} fill={colour} />
      <g
        clipPath={`url(#${wrapClip})`}
        fill="none"
        stroke={darkenColour(colour, STRAND.lightness)}
        strokeWidth={STRAND.width}
      >
        {BANDS.map(({ angle, fill, edges, strands }) => (
          <g key={angle} transform={`rotate(${angle} 10 10)`}>
            {fill && <path d={fill} fill={colour} stroke="none" />}
            {edges.map((edge) => (
              <path
                key={edge}
                d={edge}
                stroke={darkenColour(colour, BAND_EDGE.lightness)}
                strokeWidth={BAND_EDGE.width}
              />
            ))}
            {strands.map((strand) => (
              <path key={strand} d={strand} />
            ))}
          </g>
        ))}
      </g>
      <path d={BALL_OUTLINE} fill={`url(#${shading})`} />
    </svg>
  );
}
