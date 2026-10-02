import { AddMediaForm } from './AddMediaForm';
import { LanguageMediaStorageProvider } from './LanguageMediaStorageContext';

export function LanguageMediaGoals() {
  return (
    <LanguageMediaStorageProvider>
      <AddMediaForm />
    </LanguageMediaStorageProvider>
  );
}
