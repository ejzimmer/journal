const RAY_ANGLES = [0, 72, 144, 216, 288];

export function MorningGloryIcon({ width }: { width?: string }) {
  return (
    <svg viewBox="-16 -16 32 32" width={width} aria-hidden="true">
      <path
        d="M0 -14 Q7 -14 10.5 -9 Q16 -4 13.3 4.3 Q11 11 4.5 13.4 Q0 15 -4.5 13.4 Q-11 11 -13.3 4.3 Q-16 -4 -10.5 -9 Q-7 -14 0 -14 Z"
        fill="hsl(222 72% 62%)"
        stroke="hsl(228 50% 40%)"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <g stroke="hsl(225 80% 82%)" strokeWidth="1.2" strokeLinecap="round">
        {RAY_ANGLES.map((angle) => (
          <path key={angle} d="M0 0 L0 -13" transform={`rotate(${angle})`} />
        ))}
      </g>
      <circle r="5" fill="hsl(50 80% 92%)" />
      <circle r="2.2" fill="hsl(48 90% 62%)" />
    </svg>
  );
}
