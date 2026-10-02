import { AddMediaForm } from './AddMediaForm';
import { LanguageMediaStorageProvider } from './LanguageMediaStorageContext';
import { MediaList } from './MediaList';

export function LanguageMediaGoals() {
  return (
    <LanguageMediaStorageProvider>
      <MediaList />
      <AddMediaForm />
    </LanguageMediaStorageProvider>
  );
}
