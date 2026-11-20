import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { getToday } from 'shared/dates';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createStorageContext } from 'shared/storageContextTestUtils';
import { DAILY_KEY, DailyTask, ONCE_KEY } from '../../../types';
import { useOnceListMigration } from './useOnceListMigration';

const createTask = (
  id: string,
  type: DailyTask['type'],
  position: number,
): DailyTask => ({
  id,
  description: id,
  category: '🧹',
  parentId: DAILY_KEY,
  position,
  type,
  status: 'ready',
  lastCompleted: getToday(),
});

const indexById = (tasks: DailyTask[]) =>
  Object.fromEntries(tasks.map((task) => [task.id, task]));

function renderMigration(lists: Record<string, Record<string, DailyTask>>) {
  const storage = createStorageContext({
    useValue: <T,>(key?: string) => ({
      value: key ? (lists[key] as T) : undefined,
      loading: false,
      synced: true,
    }),
  });
  renderHook(useOnceListMigration, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <FirebaseContext.Provider value={storage}>
        {children}
      </FirebaseContext.Provider>
    ),
  });

  return { setValues: storage.setValues };
}

describe('splitting one-off tasks out of the daily list', () => {
  describe('when the daily list still holds one-off tasks', () => {
    it('moves them to the end of the one-off list in their old order', () => {
      const { setValues } = renderMigration({
        [DAILY_KEY]: indexById([
          createTask('vitamins', '毎日', 0),
          createTask('library', '一度', 2),
          createTask('parcel', '一度', 1),
        ]),
        [ONCE_KEY]: indexById([createTask('bank', '一度', 0)]),
      });

      expect(setValues).toHaveBeenCalledWith({
        [`${ONCE_KEY}/parcel`]: expect.objectContaining({ position: 1 }),
        [`${DAILY_KEY}/parcel`]: null,
        [`${ONCE_KEY}/library`]: expect.objectContaining({ position: 2 }),
        [`${DAILY_KEY}/library`]: null,
      });
    });
  });

  describe('when there is no one-off list yet', () => {
    it('starts it at the first position', () => {
      const { setValues } = renderMigration({
        [DAILY_KEY]: indexById([createTask('parcel', '一度', 3)]),
      });

      expect(setValues).toHaveBeenCalledWith({
        [`${ONCE_KEY}/parcel`]: expect.objectContaining({ position: 0 }),
        [`${DAILY_KEY}/parcel`]: null,
      });
    });
  });
});
