import { createContext } from 'react';
import { DAILY_KEY, ONCE_KEY, TODO_KEY, TodoTask } from '../../types';
import { DailyTaskList } from './Today/DailyTaskList';
import { ThisWeekList } from './ThisWeek/ThisWeekList';
import { DueDateList } from './DueDate/DueDateList';
import { AddTodoForm } from './AddTodoForm';

import './index.css';
import { useStorageContext } from 'shared/FirebaseContext';

export const CategoriesContext = createContext<string[] | undefined>(undefined);

export function Todo() {
  const { useValue } = useStorageContext();
  const { value: lists } =
    useValue<Record<string, Record<string, TodoTask> | string>>(TODO_KEY);
  if (!lists) {
    return null;
  }

  const tasks = Object.values(lists)
    .filter((list) => typeof list === 'object')
    .flatMap((list) => Object.values(list));
  const categories = new Set(tasks.map((task) => task.category));

  return (
    <CategoriesContext.Provider value={Array.from(categories)}>
      <div className="today todo">
        <div className="today-panel" style={{ gridArea: 'form' }}>
          <AddTodoForm />
        </div>
        <div className="daily-lists" style={{ gridArea: 'lists' }}>
          <div className="today-panel">
            <DailyTaskList listId={DAILY_KEY} />
          </div>
          <div className="today-panel">
            <DailyTaskList listId={ONCE_KEY} />
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
    </CategoriesContext.Provider>
  );
}
