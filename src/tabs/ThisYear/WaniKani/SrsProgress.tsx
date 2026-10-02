import { countSubjectsBySrsGroup } from './srsGroups';
import { SrsVial } from './SrsVial';
import { SUBJECT_TYPES, WaniKaniData } from './types';
import { VialDefs } from './VialDefs';

export function SrsProgress({ data }: { data: WaniKaniData }) {
  const subjectCounts = countSubjectsBySrsGroup(
    data.subjects,
    data.assignments,
  );

  return (
    <section className="srs-vials">
      <VialDefs />
      {SUBJECT_TYPES.map((type, index) => (
        <SrsVial
          key={type}
          type={type}
          index={index}
          {...subjectCounts[type]}
        />
      ))}
    </section>
  );
}
