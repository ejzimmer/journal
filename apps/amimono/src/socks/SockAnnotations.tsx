import { SockNumbers } from '../sockPlanner/types';
import { FootDimension } from './FootDimension';
import {
  FOOT_SOLE_AT_TOE_START_OFFSET,
  FOOT_TOE_START_DISTANCE,
  FOOT_TOE_TIP_DISTANCE,
  mapSockPoint,
} from './sockShape';

type SockAnnotationsProps = {
  numbers: SockNumbers;
};

const CUFF_EDGE = mapSockPoint('second', [75, 115]);
const TOE_START_DIMENSION_OFFSET = 80;
const LENGTH_DIMENSION_OFFSET = 110;
const TOE_TIP_EXTENSION_START = 6;

export function SockAnnotations({ numbers }: SockAnnotationsProps) {
  return (
    <g className="sock-annotations">
      <path d={`M${CUFF_EDGE.x + 2} ${CUFF_EDGE.y} H${CUFF_EDGE.x + 8}`} />
      <text x={CUFF_EDGE.x + 10} y={CUFF_EDGE.y} dominantBaseline="middle">
        {numbers.castOnStitches} sts
      </text>
      <FootDimension
        endDistance={FOOT_TOE_START_DISTANCE}
        endExtensionStart={FOOT_SOLE_AT_TOE_START_OFFSET}
        offset={TOE_START_DIMENSION_OFFSET}
        label={`${numbers.startToeAtMm} mm`}
      />
      <FootDimension
        endDistance={FOOT_TOE_TIP_DISTANCE}
        endExtensionStart={TOE_TIP_EXTENSION_START}
        offset={LENGTH_DIMENSION_OFFSET}
        label={`${numbers.lengthMm} mm`}
      />
    </g>
  );
}
