import { createContext } from 'react';
import { DAILY_KEY, ONCE_KEY } from '../../types';
import { DailyTaskList } from './Today/DailyTaskList';
import { ThisWeekList } from './ThisWeek/ThisWeekList';
import { DueDateList } from './DueDate/DueDateList';
import { AddTodoForm } from './AddTodoForm';
import { MoveToTodayButton } from './Today/MoveToTodayButton';

import './index.css';
import { TodoCategoriesProvider } from './TodoCategoriesProvider';

export const CategoriesContext = createContext<string[] | undefined>(undefined);

export function Todo() {
  return (
    <TodoCategoriesProvider>
      <div className="today todo">
        <div className="today-panel" style={{ gridArea: 'form' }}>
          <AddTodoForm />
        </div>
        <div className="daily-lists" style={{ gridArea: 'lists' }}>
          <div className="today-panel">
            <DailyTaskList listId={DAILY_KEY} />
          </div>
          <div className="today-panel">
            <DailyTaskList
              listId={ONCE_KEY}
              renderAction={(task) => <MoveToTodayButton task={task} />}
            />
          </div>
        </div>
        <div
          className="today-panel"
          style={{ gridArea: 'week', marginInlineEnd: '30px' }}
        >
          <ThisWeekList />
        </div>
        <div className="today-panel" style={{ gridArea: 'dates' }}>
          <DueDateList />
        </div>
      </div>
    </TodoCategoriesProvider>
  );
}
