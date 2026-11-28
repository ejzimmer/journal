import { TodoCategoriesProvider } from '../Todo/TodoCategoriesProvider';
import { TodayDailyTask } from './TodayDailyTask';
import { TodayWeeklyTask } from './TodayWeeklyTask';
import { TodayDueDateTask } from './TodayDueDateTask';
import { YesterdayCalories } from './YesterdayCalories';
import { TodaySymptoms } from './TodaySymptoms';
import { DailyGoals } from './DailyGoals';
import { useTodayItems } from './useTodayItems';

import './crt.css';
import '../Todo/Today/TodayTask.css';
import '../Todo/ThisWeek/ThisWeekTask.css';
import '../Todo/DueDate/DueDateTask.css';
import './Today.css';

export function Today() {
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
                  <TodayDailyTask task={task} />
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
                  <TodayWeeklyTask task={task} />
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
                  <TodayDueDateTask task={task} />
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
