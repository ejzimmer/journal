import { Books } from './books/Books';
import { Games } from './games/Games';
import { useMediaStorage } from './MediaStorageContext';
import { MediaSkeleton } from './MediaSkeleton';

export function MediaContent() {
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
