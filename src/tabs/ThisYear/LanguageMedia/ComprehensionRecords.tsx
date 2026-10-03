import { formatDayAndMonth } from '../../../shared/dates';
import {
  ComprehensionRecord,
  listComprehensionRecords,
} from './comprehensionRecords';
import { PrintSeries } from './types';

const formatRecord = ({
  date,
  lookups,
  aiQuestions,
  understood,
}: ComprehensionRecord) => {
  const counts = [
    lookups && `${lookups} looked up`,
    aiQuestions && `${aiQuestions} asked AI`,
    understood !== undefined && `${understood}% understood`,
  ].filter(Boolean);
  return `${formatDayAndMonth(date)}: ${counts.join(', ')}`;
};

export function ComprehensionRecords({ series }: { series: PrintSeries }) {
  return (
    <ul className="comprehension-records">
      {listComprehensionRecords(series).map((record) => (
        <li key={record.date}>{formatRecord(record)}</li>
      ))}
    </ul>
  );
}
