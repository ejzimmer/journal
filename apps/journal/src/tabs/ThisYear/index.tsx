import { Adventures } from './Adventures';
import { Bikes } from './Bikes';
import { getThisYear } from 'shared/dates';
import {
  STATION_RUNNING_YEAR,
  StationRunning,
} from './StationRunning/StationRunning';
import { TodoCategoriesProvider } from '../Todo/TodoCategoriesProvider';
import { DAILY_KEY } from '../../types';
import { TaskPillList } from './TaskPills/TaskPillList';
import { OnceTaskList } from './TaskPills/OnceTaskList';

import './ThisYear.css';

export function ThisYear() {
  return (
    <div className="this-year">
      <TodoCategoriesProvider>
        <div className="task-pill-lists">
          <TaskPillList listId={DAILY_KEY} />
          <OnceTaskList />
        </div>
      </TodoCategoriesProvider>
      <Bikes />
      <Adventures />
      {getThisYear() === STATION_RUNNING_YEAR && <StationRunning />}
    </div>
  );
}
