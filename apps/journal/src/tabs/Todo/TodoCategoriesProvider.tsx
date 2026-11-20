import { ReactNode } from 'react';
import { useStorageContext } from 'shared/FirebaseContext';
import { TODO_KEY, TodoTask } from '../../types';
import { CategoriesContext } from '.';

type TodoCategoriesProviderProps = { children: ReactNode };

export function TodoCategoriesProvider({
  children,
}: TodoCategoriesProviderProps) {
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
      {children}
    </CategoriesContext.Provider>
  );
}
