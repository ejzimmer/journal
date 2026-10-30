import { MediaStorageProvider } from './MediaStorageContext';
import { MediaContent } from './MediaContent';

import './index.css';

export function Media() {
  return (
    <MediaStorageProvider>
      <MediaContent />
    </MediaStorageProvider>
  );
}
