import { BikePicture } from './BikePicture';

const cardboard = 'hsl(32 55% 60%)';
const hubcap = 'hsl(0 0% 75%)';

export function Ute() {
  return (
    <BikePicture>
      <rect x="8" y="16" width="10" height="7" rx="0.5" fill={cardboard} />
      <path
        d="M13 16 V23"
        fill="none"
        stroke="hsl(32 40% 40%)"
        strokeWidth="1.2"
      />
      <path
        d="M2 22 H24 V17 Q24 15 26 15 H33 L38 22 H44 Q46 22 46 24 V32 H2 Z"
        fill="hsl(200 65% 45%)"
      />
      <path d="M27 17.5 H32 L35.5 22 H27 Z" fill="hsl(195 70% 85%)" />
      <path d="M24 22 V32" fill="none" />
      <rect
        x="43"
        y="25"
        width="3"
        height="2"
        fill="hsl(50 95% 62%)"
        strokeWidth="1"
      />
      <circle cx="11" cy="33" r="5" fill="currentColor" />
      <circle cx="37" cy="33" r="5" fill="currentColor" />
      <circle cx="11" cy="33" r="2" fill={hubcap} stroke="none" />
      <circle cx="37" cy="33" r="2" fill={hubcap} stroke="none" />
    </BikePicture>
  );
}
