import { BikePicture } from './BikePicture';

export function DoubleOhSeven() {
  return (
    <BikePicture>
      <ellipse cx="8" cy="25" rx="4.5" ry="7.5" fill="none" strokeWidth="3" />
      <ellipse
        cx="19.5"
        cy="25"
        rx="4.5"
        ry="7.5"
        fill="none"
        strokeWidth="3"
      />
      <path
        d="M26 16 H46 V20 H39 L33 34 H27 L33 20 H26 Z"
        fill="currentColor"
      />
      <path d="M34 22 Q36 27 39 24 M44 16 V14.5 M27 16 V14" fill="none" />
    </BikePicture>
  );
}
