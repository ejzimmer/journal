import { AddMediaForm } from './AddMediaForm';
import { LanguageMediaStorageProvider } from './LanguageMediaStorageContext';
import { MediaGarden } from './MediaGarden';
import { MediaList } from './MediaList';

export function LanguageMediaGoals() {
  return (
    <LanguageMediaStorageProvider>
      <MediaGarden />
      <MediaList />
      <AddMediaForm />
    </LanguageMediaStorageProvider>
  );
}
