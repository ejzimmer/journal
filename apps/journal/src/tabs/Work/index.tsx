import { WorkStorageProvider } from './WorkStorageContext';
import { WorkContent } from './WorkContent';

import './index.css';

export function Work() {
  return (
    <WorkStorageProvider>
      <WorkContent />
    </WorkStorageProvider>
  );
}
