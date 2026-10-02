import { useStorageContext } from '../../../shared/FirebaseContext';
import { Skeleton } from '../../../shared/controls/Skeleton';
import { ApiKeyForm } from './ApiKeyForm';
import { clearCachedCollections } from './collectionCache';
import { WaniKaniProgress } from './WaniKaniProgress';

import './index.css';

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
