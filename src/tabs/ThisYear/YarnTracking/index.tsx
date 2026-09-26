import { YarnTrackingForm } from './Form';
import { YarnState } from './YarnState';
import { YarnStorageProvider } from './YarnStorageContext';

export function YarnTracking({ year }: { year: number }) {
  return (
    <YarnStorageProvider year={year}>
      <div
        style={{
          padding: '60px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <YarnState />
        <div style={{ marginInline: 'auto' }}>
          <YarnTrackingForm />
        </div>
      </div>
    </YarnStorageProvider>
  );
}
