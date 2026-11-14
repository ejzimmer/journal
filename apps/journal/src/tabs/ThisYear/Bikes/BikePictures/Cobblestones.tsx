import { BikePicture } from './BikePicture';

const shades = ['hsl(215 12% 42%)', 'hsl(215 10% 52%)', 'hsl(215 14% 36%)'];
const stones = [
  { x: 3, y: 10.5, width: 13 },
  { x: 17, y: 10.5, width: 13 },
  { x: 31, y: 10.5, width: 13 },
  { x: 1, y: 19.5, width: 8 },
  { x: 10, y: 19.5, width: 13 },
  { x: 24, y: 19.5, width: 13 },
  { x: 38, y: 19.5, width: 9 },
  { x: 3, y: 28.5, width: 13 },
  { x: 17, y: 28.5, width: 13 },
  { x: 31, y: 28.5, width: 13 },
];

export function Cobblestones() {
  return (
    <BikePicture>
      {stones.map(({ x, y, width }, index) => (
        <rect
          key={`${x},${y}`}
          x={x}
          y={y}
          width={width}
          height="9"
          rx="3"
          fill={shades[index % shades.length]}
        />
      ))}
      <path
        d="M7 13.5 Q9 12.5 11 13.5 M27 22.5 Q29 21.5 31 22.5 M20 31.5 Q22 30.5 24 31.5"
        fill="none"
        stroke="hsl(215 20% 70%)"
        strokeWidth="1.2"
      />
    </BikePicture>
  );
}
