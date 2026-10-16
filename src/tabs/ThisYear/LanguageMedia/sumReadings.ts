import { getReadings } from './getReadings';
import { Comprehension, Volume } from './types';

export function sumReadings(volume: Volume): Comprehension {
  const readings = getReadings(volume);
  return {
    lookups: readings.reduce((total, { lookups }) => total + lookups, 0),
    aiQuestions: readings.reduce(
      (total, { aiQuestions }) => total + aiQuestions,
      0,
    ),
    understood: readings.findLast(({ understood }) => understood !== undefined)
      ?.understood,
  };
}
