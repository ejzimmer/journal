const PETAL_ANGLES = Array.from({ length: 9 }, (_, petal) => (petal * 360) / 9);

export function SaguaroFlowerIcon({ width }: { width?: string }) {
  return (
    <svg viewBox="-16 -16 32 32" width={width} aria-hidden="true">
      <g
        fill="hsl(50 60% 97%)"
        stroke="hsl(40 22% 60%)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      >
        {PETAL_ANGLES.map((angle) => (
          <ellipse
            key={angle}
            cy="-8"
            rx="4.4"
            ry="7.4"
            transform={`rotate(${angle})`}
          />
        ))}
      </g>
      <circle
        r="5"
        fill="hsl(48 92% 58%)"
        stroke="hsl(40 70% 42%)"
        strokeWidth="0.8"
      />
    </svg>
  );
}
