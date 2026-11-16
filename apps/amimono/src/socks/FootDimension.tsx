import { FOOT_TEXT_ANGLE, mapFootPoint } from './sockShape';

type FootDimensionProps = {
  endDistance: number;
  endExtensionStart: number;
  offset: number;
  label: string;
};

const EXTENSION_OVERHANG = 5;
const HEEL_EXTENSION_START = 6;

export function FootDimension({
  endDistance,
  endExtensionStart,
  offset,
  label,
}: FootDimensionProps) {
  const start = mapFootPoint('second', 0, offset);
  const end = mapFootPoint('second', endDistance, offset);
  const labelPoint = mapFootPoint('second', endDistance / 2, offset + 4);

  const createExtensionPath = (distance: number, extensionStart: number) => {
    const inner = mapFootPoint('second', distance, extensionStart);
    const outer = mapFootPoint('second', distance, offset + EXTENSION_OVERHANG);
    return `M${inner.x} ${inner.y} L${outer.x} ${outer.y}`;
  };

  return (
    <g className="foot-dimension">
      <path
        className="dimension-line"
        d={`M${start.x} ${start.y} L${end.x} ${end.y}`}
      />
      <path
        className="extension-line"
        d={[
          createExtensionPath(0, HEEL_EXTENSION_START),
          createExtensionPath(endDistance, endExtensionStart),
        ].join(' ')}
      />
      <text
        transform={`translate(${labelPoint.x} ${labelPoint.y}) rotate(${FOOT_TEXT_ANGLE})`}
        textAnchor="middle"
        dominantBaseline="hanging"
      >
        {label}
      </text>
    </g>
  );
}
