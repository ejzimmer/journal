import { YarnTrackingForm } from './Form';
import { YarnState } from './YarnState';
import { YarnStorageProvider } from './YarnStorageContext';

export function YarnTracking() {
  return (
    <YarnStorageProvider>
      <div
        style={{
          maxWidth: '1200px',
          width: '800px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '24px',
          marginInline: 'auto',
        }}
      >
        <YarnState />
        <div style={{ maxWidth: '400px', marginInline: 'auto' }}>
          <YarnTrackingForm />
        </div>
      </div>
    </YarnStorageProvider>
  );
}
