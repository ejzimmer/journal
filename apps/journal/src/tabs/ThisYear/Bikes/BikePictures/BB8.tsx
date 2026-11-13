import { BikePicture } from './BikePicture';

const orange = 'hsl(24 90% 52%)';

export function BB8() {
  return (
    <BikePicture>
      <circle cx="24" cy="32" r="14" fill="white" />
      <circle
        cx="24"
        cy="32"
        r="7"
        fill="none"
        stroke={orange}
        strokeWidth="3.5"
      />
      <circle cx="24" cy="32" r="3" fill="hsl(210 10% 75%)" stroke="none" />
      <path
        d="M11 27 Q14 22 18 20 M37 27 Q34 22 30 20"
        fill="none"
        stroke={orange}
        strokeWidth="2.5"
      />
      <path d="M15 17 A9 9 0 0 1 33 17 Z" fill="white" />
      <path d="M15.5 14.5 H32.5" stroke={orange} strokeWidth="2" />
      <circle cx="26" cy="11.5" r="2.6" fill="currentColor" />
      <path d="M27 8 L28 2" fill="none" />
    </BikePicture>
  );
}
