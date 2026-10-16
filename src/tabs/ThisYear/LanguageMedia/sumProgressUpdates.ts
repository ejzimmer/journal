import { getProgressUpdates } from './getProgressUpdates';
import { Comprehension, Volume } from './types';

export function sumProgressUpdates(volume: Volume): Comprehension {
  const updates = getProgressUpdates(volume);
  return {
    lookups: updates.reduce((total, { lookups }) => total + lookups, 0),
    aiQuestions: updates.reduce(
      (total, { aiQuestions }) => total + aiQuestions,
      0,
    ),
    understood: updates.findLast(({ understood }) => understood !== undefined)
      ?.understood,
  };
}
