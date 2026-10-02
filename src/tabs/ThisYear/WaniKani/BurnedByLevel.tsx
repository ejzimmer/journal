import { calculateBurnedPercentsByLevel } from './burnedPercents';
import { SUBJECT_TYPE_LABELS } from './subjectTypeLabels';
import { SUBJECT_TYPES, WaniKaniData } from './types';

export function BurnedByLevel({ data }: { data: WaniKaniData }) {
  const levels = calculateBurnedPercentsByLevel(
    data.subjects,
    data.assignments,
    data.level,
  );

  return (
    <table>
      <thead>
        <tr>
          <th>Level</th>
          {SUBJECT_TYPES.map((type) => (
            <th key={type}>{SUBJECT_TYPE_LABELS[type]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {levels.map(({ level, percents }) => (
          <tr key={level}>
            <th>{level}</th>
            {SUBJECT_TYPES.map((type) => (
              <td key={type}>{percents[type]}%</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
