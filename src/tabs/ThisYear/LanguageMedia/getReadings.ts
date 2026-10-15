import { Volume } from './types';

export const getReadings = (volume: Volume) =>
  Object.values(volume.readings ?? {}).toSorted((a, b) =>
    Temporal.Instant.compare(a.createdAt, b.createdAt),
  );
