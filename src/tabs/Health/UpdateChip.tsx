import { Ref } from 'react';
import { formatDate } from '../../shared/dates';
import { ExerciseUpdate } from '../../shared/types';
import { RecommendationIcon } from './RecommendationIcon';

type UpdateChipProps = {
  update: ExerciseUpdate;
  isEditing: boolean;
  onClick: () => void;
  ref: Ref<HTMLButtonElement>;
};

export function UpdateChip({
  update,
  isEditing,
  onClick,
  ref,
}: UpdateChipProps) {
  const { day, month, year } = formatDate(Temporal.PlainDate.from(update.date));

  return (
    <button
      ref={ref}
      className="update"
      aria-expanded={isEditing}
      onClick={onClick}
    >
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
