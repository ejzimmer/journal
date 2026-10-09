import { useId } from 'react';
import { createCloudShape } from './createCloudShape';

export function CloudShape({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const shadeId = useId();
  const outlineId = useId();
  const { hull, puffs } = createCloudShape(width, height);

  return (
    <svg
      className="cloud-shape"
      width={width}
      height={height}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={shadeId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1={height - 90}
          x2="0"
          y2={height}
        >
          <stop offset="0" stopColor="white" />
          <stop offset="1" stopColor="hsl(214 40% 96%)" />
        </linearGradient>
        <filter id={outlineId} x="-20%" y="-20%" width="140%" height="140%">
          <feMorphology
            in="SourceAlpha"
            operator="dilate"
            radius="2"
            result="grown"
          />
          <feFlood floodColor="hsl(214 32% 82%)" />
          <feComposite in2="grown" operator="in" result="outline" />
          <feMerge>
            <feMergeNode in="outline" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g fill={`url(#${shadeId})`} filter={`url(#${outlineId})`}>
        <polygon points={hull.map((point) => point.join(',')).join(' ')} />
        {puffs.map(([cx, cy, radius]) => (
          <circle key={`${cx},${cy}`} cx={cx} cy={cy} r={radius} />
        ))}
      </g>
    </svg>
  );
}
