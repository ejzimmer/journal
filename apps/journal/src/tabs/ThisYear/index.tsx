import { Adventures } from './Adventures';
import { Bikes } from './Bikes';
import { getThisYear } from 'shared/dates';
import {
  STATION_RUNNING_YEAR,
  StationRunning,
} from './StationRunning/StationRunning';
import { TodoCategoriesProvider } from '../Todo/TodoCategoriesProvider';
import { EveryDayTaskList } from './EveryDayTasks/EveryDayTaskList';

import './ThisYear.css';

export function ThisYear() {
  return (
    <div className="this-year">
      <TodoCategoriesProvider>
        <EveryDayTaskList />
      </TodoCategoriesProvider>
      <Bikes />
      <Adventures />
      {getThisYear() === STATION_RUNNING_YEAR && <StationRunning />}
    </div>
  );
}
