import { SRS_GROUPS, SrsGroup } from './types';

type SrsProgressBarProps = {
  label: string;
  total: number;
  counts: Record<SrsGroup, number>;
};

export function SrsProgressBar({ label, total, counts }: SrsProgressBarProps) {
  const description = SRS_GROUPS.map(
    (group) => `${counts[group]} ${group}`,
  ).join(', ');

  return (
    <div className="srs-progress">
      <div>{label}</div>
      <div
        className="srs-progress-bar"
        role="img"
        aria-label={`${label}: ${description} of ${total}`}
      >
        {SRS_GROUPS.map((group) => (
          <div
            key={group}
            className={group}
            title={`${counts[group]} ${group}`}
            style={{ width: `${(counts[group] / total) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
