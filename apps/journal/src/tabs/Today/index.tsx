import { useStorageContext } from 'shared/FirebaseContext';
import { DAILY_KEY, DailyTask } from '../../types';
import { TodoCategoriesProvider } from '../Todo/TodoCategoriesProvider';
import { TodayTask } from '../Todo/Today/TodayTask';
import { ThisWeekTask } from '../Todo/ThisWeek/ThisWeekTask';
import { DueDateTask } from '../Todo/DueDate/DueDateTask';
import { YesterdayCalories } from './YesterdayCalories';
import { TodaySymptoms } from './TodaySymptoms';
import { DailyGoals } from './DailyGoals';
import { useTodayItems } from './useTodayItems';

import '../Todo/index.css';
import '../Todo/Today/TodayTask.css';
import '../Todo/ThisWeek/ThisWeekTask.css';
import '../Todo/DueDate/DueDateTask.css';
import './Today.css';

export function Today() {
  const { updateItem } = useStorageContext();
  const { daily, weekly, calendar } = useTodayItems();

  return (
    <TodoCategoriesProvider>
      <div className="today today-tab">
        <div
          className="today-panel today-health"
          style={{ gridArea: 'health' }}
        >
          <YesterdayCalories />
        </div>
        <div className="today-panel" style={{ gridArea: 'lists' }}>
          <div className="todo-task-list">
            <DailyGoals />
            <ol>
              {daily.map((task) => (
                <li
                  key={task.id}
                  className={`today-task item status-${task.status} type-${task.type}`}
                >
                  <TodayTask
                    task={task}
                    listId={DAILY_KEY}
                    onChange={(task) => updateItem<DailyTask>(DAILY_KEY, task)}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="today-panel" style={{ gridArea: 'week' }}>
          <div className="todo-task-list weekly">
            <ol>
              {weekly.map((task) => (
                <li key={task.id} className="item">
                  <ThisWeekTask task={task} />
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="today-panel" style={{ gridArea: 'dates' }}>
          <div className="todo-task-list calendar">
            <ol>
              {calendar.map((task) => (
                <li key={task.id} className={`status-${task.status}`}>
                  <DueDateTask task={task} />
                </li>
              ))}
            </ol>
            <div className="today-symptoms">
              <TodaySymptoms />
            </div>
          </div>
        </div>
      </div>
    </TodoCategoriesProvider>
  );
}
