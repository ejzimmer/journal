import { useId } from 'react';
import { IconProps } from './types';
import {
  BALL_OUTLINE,
  WINDING_EDGE,
  WINDINGS,
  darkenColour,
  SHADING,
  STRAND,
} from './ballOfYarnShape';

export function BallOfYarnIcon({
  colour = 'currentColor',
  ...props
}: IconProps) {
  const id = useId();
  const wrapClip = `${id}-wrap`;
  const shading = `${id}-shading`;

  return (
    <svg viewBox="0 0 20 20" width="100%" {...props}>
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
        {WINDINGS.map(({ angle, fill, edges, strands }) => (
          <g key={angle} transform={`rotate(${angle} 10 10)`}>
            {fill && <path d={fill} fill={colour} stroke="none" />}
            {edges.map((edge) => (
              <path
                key={edge}
                d={edge}
                stroke={darkenColour(colour, WINDING_EDGE.lightness)}
                strokeWidth={WINDING_EDGE.width}
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
