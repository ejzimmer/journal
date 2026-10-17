import { BikePicture } from './BikePicture';

const glass =
  'M14 7 L13.6 10 Q11.6 13.5 13.6 17 L17 44 H31 L34.4 17 Q36.4 13.5 34.4 10 L34 7';
const froth =
  'M14 7 Q14 3.5 17.5 4 Q20.5 1.5 24 3 Q27.5 1.5 30.5 4 Q34 3.5 34 7';

export function Pint() {
  return (
    <BikePicture>
      <path d={`${glass} Z`} fill="hsl(38 90% 55%)" stroke="none" />
      <path
        d={`${froth} L34.2 8.5 Q35 11 35.2 13 H12.8 Q13 11 13.8 8.5 Z`}
        fill="white"
        stroke="none"
      />
      <path d={froth} fill="none" />
      <path d={glass} fill="none" />
    </BikePicture>
  );
}
