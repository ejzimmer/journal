import { AdventureStorageProvider } from './AdventureStorageContext';
import { Noticeboard } from './Noticeboard';

export function Adventures() {
  return (
    <AdventureStorageProvider>
      <Noticeboard />
    </AdventureStorageProvider>
  );
}
