import { ReactNode } from 'react';
import { Sock } from './types';
import { SOLE_TEXT_ANGLE, mapSolePoint } from './sockShape';

type SoleLabelProps = {
  sock: Sock;
  distance: number;
  offset: number;
  children: ReactNode;
};

export function SoleLabel({
  sock,
  distance,
  offset,
  children,
}: SoleLabelProps) {
  const point = mapSolePoint(sock, distance, offset);
  return (
    <text
      transform={`translate(${point.x} ${point.y}) rotate(${SOLE_TEXT_ANGLE})`}
      textAnchor="middle"
      dominantBaseline="middle"
    >
      {children}
    </text>
  );
}
