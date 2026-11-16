import { Adventures } from './Adventures';
import { LanguageMediaGoals } from './LanguageMedia';
import { Bikes } from './Bikes';
import { getThisYear } from 'shared/dates';
import {
  STATION_RUNNING_YEAR,
  StationRunning,
} from './StationRunning/StationRunning';
import { WaniKani } from './WaniKani';

import './ThisYear.css';

export function ThisYear() {
  return (
    <div className="this-year">
      <div className="above-garden">
        <Bikes />
        <Adventures />
        {getThisYear() === STATION_RUNNING_YEAR && <StationRunning />}
        <WaniKani />
      </div>
      <LanguageMediaGoals />
    </div>
  );
}
