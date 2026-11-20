import { SockNumbers } from '../sockPlanner/types';
import { SoleLabel } from './SoleLabel';
import { mapSockPoint } from './sockShape';

type SockAnnotationsProps = {
  numbers: SockNumbers;
};

const CUFF_TOP_CENTRE = mapSockPoint('second', [120, 98]);
const CAST_ON_LABEL_GAP = 3;

export function SockAnnotations({ numbers }: SockAnnotationsProps) {
  return (
    <g className="sock-annotations">
      <text
        x={CUFF_TOP_CENTRE.x}
        y={CUFF_TOP_CENTRE.y - CAST_ON_LABEL_GAP}
        textAnchor="middle"
      >
        {numbers.castOnStitches} sts
      </text>
      <SoleLabel sock="first" distance={150} offset={-92}>
        ← {numbers.startToeAtMm}mm
      </SoleLabel>
      <SoleLabel sock="second" distance={120} offset={52}>
        ← {numbers.lengthMm}mm →
      </SoleLabel>
    </g>
  );
}
