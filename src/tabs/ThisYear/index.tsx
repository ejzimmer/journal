import { Adventures } from './Adventures';
import { LanguageMediaGoals } from './LanguageMedia';
import { Bikes } from './Bikes';
import { getThisYear } from '../../shared/dates';
import {
  STATION_RUNNING_YEAR,
  StationRunning,
} from './StationRunning/StationRunning';
import { WaniKani } from './WaniKani';
import { YarnTracking } from './YarnTracking';

import './ThisYear.css';

export function ThisYear() {
  return (
    <div className="this-year">
      <div className="above-garden">
        <div className="yarn-and-adventures">
          <YarnTracking />
          <Adventures />
        </div>
        {getThisYear() === STATION_RUNNING_YEAR && <StationRunning />}
        <Bikes />
        <WaniKani />
      </div>
      <LanguageMediaGoals />
    </div>
  );
}
