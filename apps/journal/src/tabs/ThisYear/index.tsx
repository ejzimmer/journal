import { Adventures } from './Adventures';
import { Bikes } from './Bikes';
import { getThisYear } from 'shared/dates';
import {
  STATION_RUNNING_YEAR,
  StationRunning,
} from './StationRunning/StationRunning';
import { TodoCategoriesProvider } from '../Todo/TodoCategoriesProvider';
import { AddTodoForm } from './TaskPills/AddTodoForm';
import { DueDateTaskList } from './TaskPills/DueDateTaskList';
import { EveryDayTaskList } from './TaskPills/EveryDayTaskList';
import { OnceTaskList } from './TaskPills/OnceTaskList';
import { WeeklyTaskList } from './TaskPills/WeeklyTaskList';

import './ThisYear.css';

export function ThisYear() {
  return (
    <div className="this-year">
      <TodoCategoriesProvider>
        <AddTodoForm />
        <div className="task-pill-lists">
          <EveryDayTaskList />
          <div className="task-pill-column">
            <WeeklyTaskList />
            <DueDateTaskList />
          </div>
          <OnceTaskList />
        </div>
      </TodoCategoriesProvider>
      <Bikes />
      <Adventures />
      {getThisYear() === STATION_RUNNING_YEAR && <StationRunning />}
    </div>
  );
}
