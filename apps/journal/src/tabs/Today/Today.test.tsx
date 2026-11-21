import { act, fireEvent, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDateDaysAgo, getDateDaysAhead, getToday } from 'shared/dates';
import { ContextType, FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
import {
  CALENDAR_KEY,
  CalendarTask,
  DailyTask,
  DAILY_PATH,
  DayData,
  PROJECTS_KEY,
  ProjectDetails,
  WEEKLY_KEY,
  WeeklyTask,
} from '../../types';
import { DAILY_GOALS_KEY } from 'shared/dailyGoals/types';
import { Today } from '.';

const tax: CalendarTask = {
  id: 'tax',
  description: 'Lodge tax return',
  category: '🧾',
  parentId: CALENDAR_KEY,
  position: 0,
  dueDate: getDateDaysAhead(5),
  status: 'ready',
  statusUpdateDate: getToday(),
};

const shelves: ProjectDetails = {
  id: 'shelves',
  parentId: PROJECTS_KEY,
  position: 0,
  description: 'Put up the shelves',
  category: '🚚',
  status: 'in_progress',
  subtasks: {
    brackets: {
      id: 'brackets',
      description: 'Buy brackets',
      category: '🚚',
      position: 0,
      status: 'done',
    },
    drill: {
      id: 'drill',
      description: 'Borrow a drill',
      category: '🚚',
      position: 1,
      status: 'ready',
    },
  },
};

const createWeeklyTask = (
  id: string,
  position: number,
  frequency: number,
  timesDone: number,
): WeeklyTask => ({
  id,
  description: id,
  category: '🎹',
  parentId: WEEKLY_KEY,
  position,
  frequency,
  completed: Array.from({ length: timesDone }, () => getDateDaysAgo(6)),
});

function renderToday(seed: Record<string, unknown> = {}) {
  const storage = createMockFirebaseContext({
    today: { 暦: { tax } },
    projects: { shelves },
    ...seed,
  });
  render(
    <FirebaseContext.Provider value={storage}>
      <Today />
    </FirebaseContext.Provider>,
  );

  return { storage, user: userEvent.setup() };
}

function readValue<T>(storage: ContextType, key: string) {
  let value: T | undefined;
  function Reader() {
    value = storage.useValue<T>(key).value;
    return null;
  }
  render(
    <FirebaseContext.Provider value={storage}>
      <Reader />
    </FirebaseContext.Provider>,
  );
  return value;
}

describe('Today tab', () => {
  describe('when a due date task in the snapshot is finished during the day', () => {
    it('stays on the tab', async () => {
      const { storage } = renderToday({
        今日: { snapshot: { tax: { id: 'tax', listId: CALENDAR_KEY } } },
      });
      await screen.findByText('Lodge tax return');

      act(() =>
        storage.updateItem(CALENDAR_KEY, { ...tax, status: 'finished' }),
      );

      expect(screen.getByText('Lodge tax return')).toBeInTheDocument();
    });
  });

  describe('when several weekly tasks are due', () => {
    it('lists the ones with the most dones left to go first, whatever their position', async () => {
      renderToday({
        today: {
          暦: { tax },
          週: {
            piano: createWeeklyTask('piano', 0, 5, 3),
            plants: createWeeklyTask('plants', 1, 2, 1),
            yoga: createWeeklyTask('yoga', 2, 4, 0),
          },
        },
      });
      await screen.findByText('yoga');

      const weekly = screen.getAllByText(/^(piano|plants|yoga)$/);
      expect(weekly.map((task) => task.textContent)).toEqual([
        'yoga',
        'piano',
        'plants',
      ]);
    });
  });

  describe('when no slots have been filled', () => {
    it('shows three empty slots', async () => {
      renderToday();
      await screen.findByText('Lodge tax return');

      expect(
        screen
          .getAllByRole('listitem')
          .filter((item) => item.classList.contains('empty')),
      ).toHaveLength(3);
    });
  });

  describe('when a daily goal is a journal subtask', () => {
    describe('and the user ticks it off', () => {
      it('marks the subtask done', async () => {
        const { storage, user } = renderToday({
          今日: {
            slots: {
              goal: {
                id: 'goal',
                position: 0,
                projectPath: `${PROJECTS_KEY}/shelves`,
                subtaskPath: `${PROJECTS_KEY}/shelves/subtasks/drill`,
              },
            },
          },
        });

        await user.click(
          await screen.findByRole('checkbox', {
            name: 'Put up the shelves: Borrow a drill done',
          }),
        );

        expect(
          readValue(storage, `${PROJECTS_KEY}/shelves/subtasks/drill/status`),
        ).toBe('done');
      });
    });
  });

  describe('when a daily goal is a subtask from Amimono', () => {
    const amimonoProjectPath = 'amimono/projects/cardigan';
    const renderTodayWithAmimonoGoal = () =>
      renderToday({
        amimono: {
          projects: {
            cardigan: {
              description: 'Cardigan',
              category: '🧶',
              subtasks: {
                sleeves: { description: 'Sleeves', status: 'ready' },
              },
            },
          },
        },
        今日: {
          slots: {
            goal: {
              id: 'goal',
              position: 0,
              projectPath: amimonoProjectPath,
              subtaskPath: `${amimonoProjectPath}/subtasks/sleeves`,
            },
          },
        },
      });

    it('shows the project name with the subtask', async () => {
      renderTodayWithAmimonoGoal();

      expect(
        await screen.findByRole('checkbox', { name: 'Cardigan: Sleeves done' }),
      ).toBeInTheDocument();
    });

    describe('and the user ticks it off', () => {
      it('marks the subtask done in Amimono', async () => {
        const { storage, user } = renderTodayWithAmimonoGoal();

        await user.click(
          await screen.findByRole('checkbox', {
            name: 'Cardigan: Sleeves done',
          }),
        );

        expect(
          readValue(storage, `${amimonoProjectPath}/subtasks/sleeves/status`),
        ).toBe('done');
      });
    });
  });

  describe("when yesterday's calories haven't been entered", () => {
    describe('and the user enters both and presses Enter', () => {
      it('saves them against yesterday and hides the inputs once they power off', async () => {
        const { storage, user } = renderToday({ health: { daily: {} } });
        const caloriesIn = await screen.findByRole('textbox', { name: 'In' });

        await user.type(caloriesIn, '1850');
        await user.type(
          screen.getByRole('textbox', { name: 'Out' }),
          '2100{Enter}',
        );

        expect(
          readValue<DayData>(storage, `${DAILY_PATH}/${getDateDaysAgo(1)}`),
        ).toEqual(expect.objectContaining({ consumed: 1850, expended: 2100 }));
        fireEvent.animationEnd(caloriesIn);
        expect(caloriesIn).not.toBeInTheDocument();
      });
    });
  });

  describe('when a daily goal is a one-off task', () => {
    const parcel: DailyTask = {
      id: 'parcel',
      parentId: DAILY_GOALS_KEY,
      description: 'Post the parcel',
      category: '📦',
      position: 0,
      type: '一度',
      status: 'ready',
      lastCompleted: getDateDaysAgo(1),
    };

    it('shows it in the slot, with the remaining slots empty', async () => {
      renderToday({ 今日: { slots: { parcel } } });

      expect(await screen.findByText('Post the parcel')).toBeInTheDocument();
      expect(
        screen
          .getAllByRole('listitem')
          .filter((item) => item.classList.contains('empty')),
      ).toHaveLength(2);
    });

    describe('and the user ticks it off', () => {
      it('finishes the task', async () => {
        const { storage, user } = renderToday({ 今日: { slots: { parcel } } });

        await user.click(
          await screen.findByRole('checkbox', { name: 'Post the parcel done' }),
        );

        expect(
          readValue<DailyTask>(storage, `${DAILY_GOALS_KEY}/parcel`),
        ).toEqual(
          expect.objectContaining({
            status: 'finished',
            lastCompleted: getToday(),
          }),
        );
      });
    });
  });
});
