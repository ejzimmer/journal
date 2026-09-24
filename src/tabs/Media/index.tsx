import { Books } from './books/Books';
import { Games } from './games/Games';
import { MediaStorageProvider, useMediaStorage } from './MediaStorageContext';
import { MediaSkeleton } from './MediaSkeleton';

import './index.css';

export function Media() {
  return (
    <MediaStorageProvider>
      <MediaContent />
    </MediaStorageProvider>
  );
}

function MediaContent() {
  const { isLoading } = useMediaStorage();

  if (isLoading) {
    return <MediaSkeleton />;
  }

  return (
    <div className="media">
      <Books />
      <Games />
    </div>
  );
}
