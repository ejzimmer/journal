import { formatDayAndMonth } from './format';

type UpdateDateProps = { instant: string };

export function UpdateDate({ instant }: UpdateDateProps) {
  return (
    <time className="progress-update-date" dateTime={instant}>
      {formatDayAndMonth(instant)}
    </time>
  );
}
