import { Sock } from './types';
import { SOLE_TEXT_ANGLE, mapSolePoint } from './sockShape';

type SoleDimensionProps = {
  sock: Sock;
  endDistance: number;
  startExtensionFrom: number;
  endExtensionFrom: number;
  offset: number;
  label: string;
  labelDistance?: number;
};

const EXTENSION_OVERHANG = 5;
const LABEL_GAP = 4;

export function SoleDimension({
  sock,
  endDistance,
  startExtensionFrom,
  endExtensionFrom,
  offset,
  label,
  labelDistance = endDistance / 2,
}: SoleDimensionProps) {
  const outwardSign = Math.sign(offset);
  const start = mapSolePoint(sock, 0, offset);
  const end = mapSolePoint(sock, endDistance, offset);
  const labelPoint = mapSolePoint(
    sock,
    labelDistance,
    offset + outwardSign * LABEL_GAP,
  );

  const createExtensionPath = (distance: number, extensionFrom: number) => {
    const inner = mapSolePoint(sock, distance, extensionFrom);
    const outer = mapSolePoint(
      sock,
      distance,
      offset + outwardSign * EXTENSION_OVERHANG,
    );
    return `M${inner.x} ${inner.y} L${outer.x} ${outer.y}`;
  };

  const dimensionPath = `M${start.x} ${start.y} L${end.x} ${end.y}`;
  const extensionPath = [
    createExtensionPath(0, startExtensionFrom),
    createExtensionPath(endDistance, endExtensionFrom),
  ].join(' ');

  return (
    <g className="sole-dimension">
      <path className="halo" d={`${dimensionPath} ${extensionPath}`} />
      <path className="dimension-line" d={dimensionPath} />
      <path className="extension-line" d={extensionPath} />
      <text
        transform={`translate(${labelPoint.x} ${labelPoint.y}) rotate(${SOLE_TEXT_ANGLE})`}
        textAnchor="middle"
        dominantBaseline={outwardSign > 0 ? 'hanging' : 'auto'}
      >
        {label}
      </text>
    </g>
  );
}
