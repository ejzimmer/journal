import { useEffect, useId } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { Skeleton } from '../../../shared/controls/Skeleton';
import { ApiKeyForm } from './ApiKeyForm';
import { InvalidApiKeyError } from './api';
import { clearCachedCollections } from './collectionCache';
import { SrsProgressBar } from './SrsProgressBar';
import {
  calculateBurnedPercentsByLevel,
  calculateLevelProgress,
  countSubjectsBySrsGroup,
  predictDaysToFinish,
} from './stats';
import { SUBJECT_TYPES, SubjectType, WaniKaniData } from './types';
import { useWaniKaniData } from './useWaniKaniData';

import './index.css';

const SUBJECT_TYPE_LABELS: Record<SubjectType, string> = {
  radical: 'Radicals',
  kanji: 'Kanji',
  vocabulary: 'Vocabulary',
};

export const API_KEY_PATH = 'wanikani/apiKey';

export function WaniKani() {
  const { useValue, setValue } = useStorageContext();
  const { value: apiKey, loading } = useValue<string>(API_KEY_PATH);

  if (loading) {
    return <Skeleton numRows={3} />;
  }

  if (!apiKey) {
    return (
      <ApiKeyForm
        onSubmit={async (apiKey) => {
          await clearCachedCollections();
          setValue(API_KEY_PATH, apiKey);
        }}
      />
    );
  }

  return (
    <WaniKaniProgress
      key={apiKey}
      apiKey={apiKey}
      onInvalidApiKey={() => setValue(API_KEY_PATH, null)}
    />
  );
}

type WaniKaniProgressProps = {
  apiKey: string;
  onInvalidApiKey: () => void;
};

function WaniKaniProgress({ apiKey, onInvalidApiKey }: WaniKaniProgressProps) {
  const { data, error } = useWaniKaniData(apiKey);
  const isApiKeyInvalid = error instanceof InvalidApiKeyError;

  useEffect(() => {
    if (isApiKeyInvalid) onInvalidApiKey();
  }, [isApiKeyInvalid, onInvalidApiKey]);

  if (isApiKeyInvalid) {
    return null;
  }
  if (error) {
    return <div className="wanikani">Couldn't load WaniKani</div>;
  }
  if (!data) {
    return <Skeleton numRows={3} />;
  }

  return (
    <div className="wanikani">
      <CurrentLevel data={data} />
      <SrsProgress data={data} />
      <BurnedByLevel data={data} />
    </div>
  );
}

function CurrentLevel({ data }: { data: WaniKaniData }) {
  const { radical, kanji } = calculateLevelProgress(
    data.subjects,
    data.assignments,
    data.level,
  );

  const headingId = useId();
  const daysToFinish = predictDaysToFinish(
    data.levelProgressions,
    data.level,
    Date.now(),
  );

  return (
    <section aria-labelledby={headingId}>
      <h3 id={headingId}>Level {data.level}</h3>
      <div>
        Radicals {radical.passed} / {radical.total}
      </div>
      <div>
        Kanji {kanji.passed} / {kanji.needed}
      </div>
      {daysToFinish !== undefined && (
        <div>{daysToFinish} days to finish level 60</div>
      )}
    </section>
  );
}

function SrsProgress({ data }: { data: WaniKaniData }) {
  const subjectCounts = countSubjectsBySrsGroup(
    data.subjects,
    data.assignments,
  );

  return (
    <section>
      {SUBJECT_TYPES.map((type) => (
        <SrsProgressBar
          key={type}
          label={SUBJECT_TYPE_LABELS[type]}
          {...subjectCounts[type]}
        />
      ))}
    </section>
  );
}

function BurnedByLevel({ data }: { data: WaniKaniData }) {
  const levels = calculateBurnedPercentsByLevel(
    data.subjects,
    data.assignments,
    data.level,
  );

  return (
    <table>
      <thead>
        <tr>
          <th>Level</th>
          {SUBJECT_TYPES.map((type) => (
            <th key={type}>{SUBJECT_TYPE_LABELS[type]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {levels.map(({ level, percents }) => (
          <tr key={level}>
            <th>{level}</th>
            {SUBJECT_TYPES.map((type) => (
              <td key={type}>{percents[type]}%</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
