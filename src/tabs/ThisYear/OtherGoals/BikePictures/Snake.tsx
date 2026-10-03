import { BikePicture } from './BikePicture';

const green = 'hsl(100 55% 45%)';
const body = 'M5 42 Q16 46 22 39 Q28 32 19 27 Q11 22 19 15 Q25 10 31 13';

export function Snake() {
  return (
    <BikePicture>
      <path d={body} fill="none" strokeWidth="8" />
      <path d={body} fill="none" stroke={green} strokeWidth="5" />
      <path
        d="M8 43 L10 41 M14 43.5 L15 41 M21 38 L19 37 M20 28 L18 30 M17 18 L19 20"
        fill="none"
        stroke="hsl(55 80% 60%)"
      />
      <ellipse cx="35" cy="13" rx="6" ry="4.5" fill={green} />
      <circle cx="36" cy="11" r="1.3" fill="currentColor" stroke="none" />
      <path
        d="M41 14 L45 13 M43 13.5 L46 11 M43 13.5 L46 15"
        fill="none"
        stroke="hsl(0 80% 50%)"
        strokeWidth="1.3"
      />
    </BikePicture>
  );
}
