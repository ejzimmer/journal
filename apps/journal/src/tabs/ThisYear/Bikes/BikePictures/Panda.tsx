import { BikePicture } from './BikePicture';

const blush = 'hsl(0 80% 70%)';

export function Panda() {
  return (
    <BikePicture>
      <circle cx="13" cy="13" r="5.5" fill="currentColor" />
      <circle cx="35" cy="13" r="5.5" fill="currentColor" />
      <circle cx="24" cy="27" r="16" fill="white" />
      <ellipse
        cx="17.5"
        cy="25"
        rx="4"
        ry="5.5"
        fill="currentColor"
        transform="rotate(30 17.5 25)"
      />
      <ellipse
        cx="30.5"
        cy="25"
        rx="4"
        ry="5.5"
        fill="currentColor"
        transform="rotate(-30 30.5 25)"
      />
      <circle cx="18" cy="24" r="1.4" fill="white" stroke="none" />
      <circle cx="30" cy="24" r="1.4" fill="white" stroke="none" />
      <ellipse cx="24" cy="31" rx="2.6" ry="1.8" fill="currentColor" />
      <path d="M21 34.5 Q24 37 27 34.5" fill="none" />
      <circle cx="13" cy="32" r="2.5" fill={blush} stroke="none" />
      <circle cx="35" cy="32" r="2.5" fill={blush} stroke="none" />
    </BikePicture>
  );
}
