import { SrsProgressBar } from './SrsProgressBar';
import { countSubjectsBySrsGroup } from './srsGroups';
import { SUBJECT_TYPE_LABELS } from './subjectTypeLabels';
import { SUBJECT_TYPES, WaniKaniData } from './types';

export function SrsProgress({ data }: { data: WaniKaniData }) {
  const subjectCounts = countSubjectsBySrsGroup(
    data.subjects,
    data.assignments,
  );

  return (
    <section>
      {SUBJECT_TYPES.map((type) => (
        <SrsProgressBar
          key={type}
          label={SUBJECT_TYPE_LABELS[type]}
          {...subjectCounts[type]}
        />
      ))}
    </section>
  );
}
