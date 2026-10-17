import { BikePicture } from './BikePicture';

const toothCount = 28;
const toothProfile = [
  { offset: -0.35, radius: 18.5 },
  { offset: -0.18, radius: 21.5 },
  { offset: 0.18, radius: 21.5 },
  { offset: 0.35, radius: 18.5 },
];
const teeth = Array.from({ length: toothCount }, (_, tooth) =>
  toothProfile.map(({ offset, radius }) => {
    const angle = (2 * Math.PI * (tooth + offset)) / toothCount;
    return `${24 + radius * Math.cos(angle)} ${24 + radius * Math.sin(angle)}`;
  }),
).flat();
const ring = `M${teeth.join(' L')} Z M37 24 A13 13 0 1 0 11 24 A13 13 0 1 0 37 24 Z`;

export function Chainring() {
  return (
    <BikePicture>
      <path d={ring} fill="hsl(210 8% 70%)" fillRule="evenodd" />
    </BikePicture>
  );
}
