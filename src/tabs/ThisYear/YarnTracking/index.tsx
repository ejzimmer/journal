import { YarnTrackingForm } from './Form';
import { YarnBalance } from './YarnBalance';
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
        <div
          style={{
            marginInline: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <YarnBalance />
          <YarnTrackingForm />
        </div>
      </div>
    </YarnStorageProvider>
  );
}
