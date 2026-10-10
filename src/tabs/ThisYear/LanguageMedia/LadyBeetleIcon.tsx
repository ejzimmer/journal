import { LadyBeetle, LadyBeetleColour } from './LadyBeetle';

export function LadyBeetleIcon({
  colour,
  width,
}: {
  colour: LadyBeetleColour;
  width?: string;
}) {
  return (
    <svg viewBox="0 0 36 30" width={width} aria-hidden="true">
      <LadyBeetle colour={colour} />
    </svg>
  );
}
