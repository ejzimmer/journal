import { LanguageMediaGoals } from './LanguageMedia';
import { OtherGoals } from './OtherGoals';
import { StationRunning } from './StationRunning/StationRunning';
import { YarnTracking } from './YarnTracking';

export function ThisYear() {
  return (
    <div style={{ display: 'grid', gap: '36px', maxWidth: '100vw' }}>
      <YarnTracking />
      <StationRunning />
      <OtherGoals />
      <LanguageMediaGoals />
    </div>
  );
}
