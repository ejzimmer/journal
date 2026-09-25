import { act } from '@testing-library/react';
import { getDateDaysAgo } from '../dateTestUtils';
import { getToday } from '../dates';
import { DailyJob, useDailyJob } from './DailyJobsContext';
import { createDailyJobsStorage, renderDailyJob } from './dailyJobsTestUtils';

const LAST_RUN_KEY = 'job-last-run';

const renderJob = (run: () => void, storedValues: Record<string, unknown>) => {
  const storage = createDailyJobsStorage(storedValues);
  const { rerender } = renderDailyJob(
    () => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }),
    storage,
  );

  return { storage, rerender };
};

describe('daily jobs', () => {
  describe('when the app is opened', () => {
    describe("and the job hasn't run today", () => {
      it('runs the job', () => {
        const run = jest.fn();

        renderJob(run, {});

        expect(run).toHaveBeenCalledTimes(1);
      });

      it('records when it ran', () => {
        const run = jest.fn();

        const { storage } = renderJob(run, {});

        expect(storage.setValue).toHaveBeenCalledWith(
          LAST_RUN_KEY,
          getToday().toString(),
        );
      });
    });

    describe('and the job last ran on an earlier day', () => {
      it('runs the job', () => {
        const run = jest.fn();

        renderJob(run, { [LAST_RUN_KEY]: getDateDaysAgo(1) });

        expect(run).toHaveBeenCalledTimes(1);
      });
    });

    describe('and the job has already run today', () => {
      it("doesn't run the job", () => {
        const run = jest.fn();

        renderJob(run, { [LAST_RUN_KEY]: new Date().getTime() });

        expect(run).not.toHaveBeenCalled();
      });
    });

    describe('and several jobs are registered', () => {
      it('runs all of them', () => {
        const cleanUpTasks = jest.fn();
        const updateTasks = jest.fn();

        renderDailyJob(() => {
          useDailyJob({ lastRunKey: 'clean-up-last-run', run: cleanUpTasks });
          useDailyJob({ lastRunKey: 'update-last-run', run: updateTasks });
        }, createDailyJobsStorage({}));

        expect(cleanUpTasks).toHaveBeenCalledTimes(1);
        expect(updateTasks).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("while the job's data is still loading", () => {
    describe("when the last run time hasn't loaded", () => {
      it("doesn't run the job", () => {
        const run = jest.fn();
        const storage = createDailyJobsStorage(
          {},
          { useValue: () => ({ value: undefined, loading: true }) },
        );

        renderDailyJob(
          () => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }),
          storage,
        );

        expect(run).not.toHaveBeenCalled();
      });
    });

    describe("when the job isn't ready", () => {
      it("doesn't run the job", () => {
        const run = jest.fn();

        renderDailyJob(
          () => useDailyJob({ lastRunKey: LAST_RUN_KEY, isReady: false, run }),
          createDailyJobsStorage({}),
        );

        expect(run).not.toHaveBeenCalled();
      });

      it('runs the job once it becomes ready', () => {
        const run = jest.fn();
        let isReady = false;

        const { rerender } = renderDailyJob(
          () => useDailyJob({ lastRunKey: LAST_RUN_KEY, isReady, run }),
          createDailyJobsStorage({}),
        );

        isReady = true;
        rerender();

        expect(run).toHaveBeenCalledTimes(1);
      });

      it('runs it against the data from the render it became ready on', () => {
        const seenData: string[] = [];
        let job: DailyJob = {
          lastRunKey: LAST_RUN_KEY,
          isReady: false,
          run: () => seenData.push('stale data'),
        };

        const { rerender } = renderDailyJob(
          () => useDailyJob(job),
          createDailyJobsStorage({}),
        );

        job = {
          lastRunKey: LAST_RUN_KEY,
          isReady: true,
          run: () => seenData.push('fresh data'),
        };
        rerender();

        expect(seenData).toEqual(['fresh data']);
      });
    });
  });

  describe('when a job has run in this session', () => {
    it("doesn't run it again, however often its component re-renders", () => {
      const run = jest.fn();

      const { rerender } = renderJob(run, {});
      rerender();
      rerender();

      expect(run).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the app is left open across midnight', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-09-19T22:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('and midnight passes with the tab open', () => {
      it('runs each job again', () => {
        const run = jest.fn();

        renderJob(run, {});
        expect(run).toHaveBeenCalledTimes(1);

        act(() => {
          jest.advanceTimersByTime(
            Temporal.Duration.from({ hours: 4 }).total('milliseconds'),
          );
        });

        expect(run).toHaveBeenCalledTimes(2);
      });
    });

    describe('and the tab is revisited on the new day', () => {
      it('runs each job again', () => {
        const run = jest.fn();

        renderJob(run, {});
        expect(run).toHaveBeenCalledTimes(1);

        act(() => {
          jest.setSystemTime(new Date('2026-09-20T08:00:00'));
          document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(run).toHaveBeenCalledTimes(2);
      });
    });

    describe('and the tab is revisited on the same day', () => {
      it("doesn't run a job again", () => {
        const run = jest.fn();

        renderJob(run, {});

        act(() => {
          jest.setSystemTime(new Date('2026-09-19T23:30:00'));
          document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(run).toHaveBeenCalledTimes(1);
      });
    });
  });
});
