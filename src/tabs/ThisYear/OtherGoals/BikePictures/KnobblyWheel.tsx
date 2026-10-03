import { BikePicture } from './BikePicture';

const tyre = 'hsl(0 0% 25%)';
const steel = 'hsl(210 8% 60%)';
const knobAngles = Array.from({ length: 30 }, (_, index) => index * 12);
const spokes = Array.from({ length: 16 }, (_, index) => {
  const angle = (Math.PI * index) / 8;
  const hubX = 24 + 3 * Math.cos(angle);
  const hubY = 24 + 3 * Math.sin(angle);
  const rimX = 24 + 16 * Math.cos(angle + 0.25);
  const rimY = 24 + 16 * Math.sin(angle + 0.25);
  return `M${hubX} ${hubY} L${rimX} ${rimY}`;
}).join(' ');

export function KnobblyWheel() {
  return (
    <BikePicture>
      {knobAngles.map((angle) => (
        <rect
          key={angle}
          x="23.1"
          y="2.6"
          width="1.8"
          height="1.6"
          rx="0.4"
          fill={tyre}
          transform={`rotate(${angle} 24 24)`}
        />
      ))}
      <circle
        cx="24"
        cy="24"
        r="18.6"
        fill="none"
        stroke={tyre}
        strokeWidth="2.4"
      />
      <circle
        cx="24"
        cy="24"
        r="16.5"
        fill="none"
        stroke="hsl(210 8% 70%)"
        strokeWidth="1.6"
      />
      <path d={spokes} fill="none" stroke={steel} strokeWidth="0.6" />
      <circle cx="24" cy="24" r="3" fill={steel} strokeWidth="1" />
    </BikePicture>
  );
}
