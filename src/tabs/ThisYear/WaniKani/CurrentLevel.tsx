import { useId } from 'react';
import { predictDaysToFinish } from './levelPrediction';
import { calculateLevelProgress } from './levelProgress';
import { WaniKaniData } from './types';

export function CurrentLevel({ data }: { data: WaniKaniData }) {
  const { radical, kanji } = calculateLevelProgress(
    data.subjects,
    data.assignments,
    data.level,
  );

  const headingId = useId();
  const daysToFinish = predictDaysToFinish(data.levelProgressions, data.level);

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>Level {data.level}</h3>
      <div>
        Radicals {radical.passed} / {radical.total}
      </div>
      <div>
        Kanji {kanji.passed} / {kanji.needed}
      </div>
      {daysToFinish !== undefined && (
        <div>{daysToFinish} days remaining</div>
      )}
    </section>
  );
}
