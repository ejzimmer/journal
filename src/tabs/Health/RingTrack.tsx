import { RING_CENTRE, RING_WIDTH } from './ringGeometry';

type RingTrackProps = {
  radius: number;
};

export function RingTrack({ radius }: RingTrackProps) {
  return (
    <circle
      className="track"
      cx={RING_CENTRE}
      cy={RING_CENTRE}
      r={radius}
      strokeWidth={RING_WIDTH}
    />
  );
}
