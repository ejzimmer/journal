import { formatDate } from '../../shared/dates';
import { ExerciseUpdate } from '../../shared/types';
import { RecommendationIcon } from './RecommendationIcon';

export function UpdateCell({ update }: { update: ExerciseUpdate }) {
  const { day, month, year } = formatDate(Temporal.PlainDate.from(update.date));

  return (
    <td>
      <div className="date">
        {day} {month} {year}
      </div>
      {update.details}
      {update.recommendation && (
        <RecommendationIcon recommendation={update.recommendation} />
      )}
    </td>
  );
}
