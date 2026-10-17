import { Adventures } from './Adventures';
import { LanguageMediaGoals } from './LanguageMedia';
import { Bikes } from './Bikes';
import { StationRunning } from './StationRunning/StationRunning';
import { WaniKani } from './WaniKani';
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
      <Bikes />
      <WaniKani />
      <LanguageMediaGoals />
    </div>
  );
}
