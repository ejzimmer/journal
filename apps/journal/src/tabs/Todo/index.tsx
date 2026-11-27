import { createContext } from 'react';
import { DueDateList } from './DueDate/DueDateList';
import { AddTodoForm } from './AddTodoForm';

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
        <div className="today-panel" style={{ gridArea: 'dates' }}>
          <DueDateList />
        </div>
      </div>
    </TodoCategoriesProvider>
  );
}
