import { useState } from 'react';
import {
  createV2Copy,
  listVersionDifferences,
} from '../shared/localFirst/v2Shape';
import { useDataVersions } from './DataVersionsContext';
import './index.css';

const MAX_LISTED_DIFFERENCES = 50;

type Progress =
  | { status: 'idle' }
  | { status: 'comparing' }
  | { status: 'copying' }
  | { status: 'failed'; message: string }
  | { status: 'compared'; differences: string[] };

export function DataVersions() {
  const { readSource, switchReadSource, fetchDatabase, replaceV2 } =
    useDataVersions();
  const [progress, setProgress] = useState<Progress>({ status: 'idle' });

  const compareVersions = async () => {
    setProgress({ status: 'comparing' });
    try {
      const differences = listVersionDifferences(await fetchDatabase());
      setProgress({ status: 'compared', differences });
    } catch {
      setProgress({ status: 'failed', message: "Couldn't load the database." });
    }
  };

  const copyV1ToV2 = async () => {
    setProgress({ status: 'copying' });
    try {
      await replaceV2(createV2Copy(await fetchDatabase()));
    } catch {
      setProgress({ status: 'failed', message: "Couldn't copy v1 to v2." });
      return;
    }
    await compareVersions();
  };

  const isBusy =
    progress.status === 'comparing' || progress.status === 'copying';
  const versionsMatch =
    progress.status === 'compared' && progress.differences.length === 0;
  const otherSource = readSource === 'v1' ? 'v2' : 'v1';

  return (
    <section className="data-versions">
      <h2>Data versions</h2>
      <p>
        Reading from <strong>{readSource}</strong>. Every save goes to both.
      </p>

      <div className="actions">
        <button onClick={compareVersions} disabled={isBusy}>
          Compare v1 and v2
        </button>
        <button onClick={copyV1ToV2} disabled={isBusy}>
          Copy v1 to v2
        </button>
        <button
          onClick={() => switchReadSource(otherSource)}
          disabled={otherSource === 'v2' && !versionsMatch}
        >
          Read from {otherSource}
        </button>
      </div>

      <div role="status">
        {progress.status === 'comparing' && 'Comparing…'}
        {progress.status === 'copying' && 'Copying…'}
        {progress.status === 'failed' && progress.message}
        {progress.status === 'compared' &&
          (versionsMatch
            ? 'v1 and v2 match.'
            : `${progress.differences.length} ${
                progress.differences.length === 1 ? 'difference' : 'differences'
              } between v1 and v2.`)}
      </div>

      {progress.status === 'compared' && !versionsMatch && (
        <ul className="differences" aria-label="Differences">
          {progress.differences.slice(0, MAX_LISTED_DIFFERENCES).map((path) => (
            <li key={path}>
              <code>{path}</code>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
