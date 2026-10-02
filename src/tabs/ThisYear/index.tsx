import { Adventures } from './Adventures';
import { OtherGoals } from './OtherGoals';
import { StationRunning } from './StationRunning/StationRunning';
import { YarnTracking } from './YarnTracking';

import './ThisYear.css';

export function ThisYear() {
  return (
    <div style={{ display: 'grid', gap: '36px', maxWidth: '100vw' }}>
      <div className="yarn-and-adventures">
        <YarnTracking />
        <Adventures />
      </div>
      <StationRunning />
      <OtherGoals />
    </div>
  );
}
