import { useState } from 'react';
import { listVersionDifferences } from '../shared/localFirst/v2Shape';
import { useDataVersions } from './DataVersionsContext';
import './index.css';

const MAX_LISTED_DIFFERENCES = 50;

type Comparison =
  | { status: 'idle' }
  | { status: 'comparing' }
  | { status: 'failed' }
  | { status: 'done'; differences: string[] };

export function DataVersions() {
  const { readSource, switchReadSource, fetchDatabase } = useDataVersions();
  const [comparison, setComparison] = useState<Comparison>({ status: 'idle' });

  const compareVersions = async () => {
    setComparison({ status: 'comparing' });
    try {
      const differences = listVersionDifferences(await fetchDatabase());
      setComparison({ status: 'done', differences });
    } catch {
      setComparison({ status: 'failed' });
    }
  };

  const versionsMatch =
    comparison.status === 'done' && comparison.differences.length === 0;
  const otherSource = readSource === 'v1' ? 'v2' : 'v1';

  return (
    <section className="data-versions">
      <h2>Data versions</h2>
      <p>
        Reading from <strong>{readSource}</strong>. Every save goes to both.
      </p>

      <div className="actions">
        <button
          onClick={compareVersions}
          disabled={comparison.status === 'comparing'}
        >
          Compare v1 and v2
        </button>
        <button
          onClick={() => switchReadSource(otherSource)}
          disabled={otherSource === 'v2' && !versionsMatch}
        >
          Read from {otherSource}
        </button>
      </div>

      <div role="status">
        {comparison.status === 'comparing' && 'Comparing…'}
        {comparison.status === 'failed' && "Couldn't load the database."}
        {comparison.status === 'done' &&
          (versionsMatch
            ? 'v1 and v2 match.'
            : `${comparison.differences.length} ${
                comparison.differences.length === 1
                  ? 'difference'
                  : 'differences'
              } between v1 and v2.`)}
      </div>

      {comparison.status === 'done' && !versionsMatch && (
        <ul className="differences" aria-label="Differences">
          {comparison.differences
            .slice(0, MAX_LISTED_DIFFERENCES)
            .map((path) => (
              <li key={path}>
                <code>{path}</code>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
