import { createContext } from 'react';
import { AddTodoForm } from './AddTodoForm';

import './index.css';
import { TodoCategoriesProvider } from './TodoCategoriesProvider';

export const CategoriesContext = createContext<string[] | undefined>(undefined);

export function Todo() {
  return (
    <TodoCategoriesProvider>
      <div className="today todo">
        <div className="today-panel">
          <AddTodoForm />
        </div>
      </div>
    </TodoCategoriesProvider>
  );
}
