import { SockNumbers } from '../sockPlanner/types';
import { SoleDimension } from './SoleDimension';
import {
  SOLE_INSTEP_AT_TOE_START_OFFSET,
  SOLE_SOLE_OFFSET,
  SOLE_TOE_START_DISTANCE,
  SOLE_TOE_TIP_DISTANCE,
  SOLE_TOE_TIP_OFFSET,
  mapSockPoint,
} from './sockShape';

type SockAnnotationsProps = {
  numbers: SockNumbers;
};

const CUFF_TOP_CENTRE = mapSockPoint('second', [120, 98]);
const CAST_ON_LABEL_GAP = 3;
const TOE_START_DIMENSION_OFFSET = -110;
const TOE_START_LABEL_DISTANCE = 140;
const LENGTH_DIMENSION_OFFSET = 60;
const EXTENSION_GAP = 4;

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
      <SoleDimension
        sock="first"
        endDistance={SOLE_TOE_START_DISTANCE}
        startExtensionFrom={-EXTENSION_GAP}
        endExtensionFrom={SOLE_INSTEP_AT_TOE_START_OFFSET - EXTENSION_GAP}
        offset={TOE_START_DIMENSION_OFFSET}
        label={`${numbers.startToeAtMm} mm`}
        labelDistance={TOE_START_LABEL_DISTANCE}
      />
      <SoleDimension
        sock="second"
        endDistance={SOLE_TOE_TIP_DISTANCE}
        startExtensionFrom={SOLE_SOLE_OFFSET + EXTENSION_GAP}
        endExtensionFrom={SOLE_TOE_TIP_OFFSET + EXTENSION_GAP}
        offset={LENGTH_DIMENSION_OFFSET}
        label={`${numbers.lengthMm} mm`}
      />
    </g>
  );
}
