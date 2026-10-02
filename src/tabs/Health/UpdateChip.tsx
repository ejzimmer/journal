import { MouseEventHandler } from 'react';
import { formatDate } from '../../shared/dates';
import { ExerciseUpdate } from '../../shared/types';
import { RecommendationIcon } from './RecommendationIcon';

type UpdateChipProps = {
  update: ExerciseUpdate;
  isEditing: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

export function UpdateChip({ update, isEditing, onClick }: UpdateChipProps) {
  const { day, month, year } = formatDate(Temporal.PlainDate.from(update.date));

  return (
    <button className="update" aria-expanded={isEditing} onClick={onClick}>
      <time dateTime={update.date}>
        {day} {month} {year}
      </time>
      <span className="details">{update.details}</span>
      {update.recommendation && (
        <RecommendationIcon recommendation={update.recommendation} />
      )}
    </button>
  );
}
