import { formatWeekday } from './utils';

type CompletedDatesProps = { dates: string[] };

export function CompletedDates({ dates }: CompletedDatesProps) {
  return (
    <ol className="dates-popover">
      {dates.map((date) => (
        <li key={date}>{formatWeekday(date)}</li>
      ))}
    </ol>
  );
}
