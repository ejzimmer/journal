import { YarnStorageProvider } from './YarnStorageContext';
import { YarnYears } from './YarnYears';

import './YarnTracking.css';

export function YarnTracking() {
  return (
    <YarnStorageProvider>
      <YarnYears />
    </YarnStorageProvider>
  );
}
