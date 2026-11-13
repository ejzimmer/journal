import { act } from '@testing-library/react';
import { getDateDaysAgo, getToday } from '../dates';
import { DailyJob, useDailyJob } from './DailyJobsContext';
import { createDailyJobsStorage, renderDailyJob } from './dailyJobsTestUtils';

const LAST_RUN_KEY = 'job-last-run';

const renderJob = async (
  run: () => void,
  storedValues: Record<string, unknown>,
) => {
  const storage = createDailyJobsStorage(storedValues);
  const { rerender } = await renderDailyJob(
    () => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }),
    storage,
  );

  return { storage, rerender };
};

describe('daily jobs', () => {
  describe('when the app is opened', () => {
    describe("and the job hasn't run today", () => {
      it('runs the job', async () => {
        const run = jest.fn();

        await renderJob(run, {});

        expect(run).toHaveBeenCalledTimes(1);
      });

      it('claims today for it', async () => {
        const run = jest.fn();

        const { storage } = await renderJob(run, {});

        expect(storage.claimDailyRun).toHaveBeenCalledWith(
          LAST_RUN_KEY,
          getToday(),
        );
      });

      describe('but another device claims today first', () => {
        it("doesn't run the job", async () => {
          const run = jest.fn();
          const storage = createDailyJobsStorage(
            {},
            { claimDailyRun: jest.fn().mockResolvedValue(false) },
          );

          await renderDailyJob(
            () => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }),
            storage,
          );

          expect(run).not.toHaveBeenCalled();
        });
      });
    });

    describe('and the job last ran on an earlier day', () => {
      it('runs the job', async () => {
        const run = jest.fn();

        await renderJob(run, { [LAST_RUN_KEY]: getDateDaysAgo(1) });

        expect(run).toHaveBeenCalledTimes(1);
      });
    });

    describe('and the job has already run today', () => {
      it("doesn't run the job", async () => {
        const run = jest.fn();

        await renderJob(run, { [LAST_RUN_KEY]: getToday() });

        expect(run).not.toHaveBeenCalled();
      });
    });

    describe('and several jobs are registered', () => {
      it('runs all of them', async () => {
        const cleanUpTasks = jest.fn();
        const updateTasks = jest.fn();

        await renderDailyJob(() => {
          useDailyJob({ lastRunKey: 'clean-up-last-run', run: cleanUpTasks });
          useDailyJob({ lastRunKey: 'update-last-run', run: updateTasks });
        }, createDailyJobsStorage({}));

        expect(cleanUpTasks).toHaveBeenCalledTimes(1);
        expect(updateTasks).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("while the job's data hasn't come from the server yet", () => {
    describe("when the last run time hasn't come from the server yet", () => {
      it("doesn't run the job", async () => {
        const run = jest.fn();
        const storage = createDailyJobsStorage(
          {},
          {
            useValue: <T,>() => ({
              value: '2026-01-01' as T,
              loading: false,
              synced: false,
            }),
          },
        );

        await renderDailyJob(
          () => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }),
          storage,
        );

        expect(run).not.toHaveBeenCalled();
      });
    });

    describe("when the job isn't ready", () => {
      it("doesn't run the job", async () => {
        const run = jest.fn();

        await renderDailyJob(
          () => useDailyJob({ lastRunKey: LAST_RUN_KEY, isReady: false, run }),
          createDailyJobsStorage({}),
        );

        expect(run).not.toHaveBeenCalled();
      });

      it('runs the job once it becomes ready', async () => {
        const run = jest.fn();
        let isReady = false;

        const { rerender } = await renderDailyJob(
          () => useDailyJob({ lastRunKey: LAST_RUN_KEY, isReady, run }),
          createDailyJobsStorage({}),
        );

        isReady = true;
        await rerender();

        expect(run).toHaveBeenCalledTimes(1);
      });

      it('runs it against the data from the render it became ready on', async () => {
        const seenData: string[] = [];
        let job: DailyJob = {
          lastRunKey: LAST_RUN_KEY,
          isReady: false,
          run: () => seenData.push('stale data'),
        };

        const { rerender } = await renderDailyJob(
          () => useDailyJob(job),
          createDailyJobsStorage({}),
        );

        job = {
          lastRunKey: LAST_RUN_KEY,
          isReady: true,
          run: () => seenData.push('fresh data'),
        };
        await rerender();

        expect(seenData).toEqual(['fresh data']);
      });
    });
  });

  describe('when a job has run in this session', () => {
    it("doesn't run it again, however often its component re-renders", async () => {
      const run = jest.fn();

      const { rerender } = await renderJob(run, {});
      await rerender();
      await rerender();

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
      it('runs each job again', async () => {
        const run = jest.fn();

        await renderJob(run, {});
        expect(run).toHaveBeenCalledTimes(1);

        await act(async () => {
          jest.advanceTimersByTime(
            Temporal.Duration.from({ hours: 4 }).total('milliseconds'),
          );
        });

        expect(run).toHaveBeenCalledTimes(2);
      });
    });

    describe('and the tab is revisited on the new day', () => {
      it('runs each job again', async () => {
        const run = jest.fn();

        await renderJob(run, {});
        expect(run).toHaveBeenCalledTimes(1);

        await act(async () => {
          jest.setSystemTime(new Date('2026-09-20T08:00:00'));
          document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(run).toHaveBeenCalledTimes(2);
      });
    });

    describe('and the tab is revisited on the same day', () => {
      it("doesn't run a job again", async () => {
        const run = jest.fn();

        await renderJob(run, {});

        act(() => {
          jest.setSystemTime(new Date('2026-09-19T23:30:00'));
          document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(run).toHaveBeenCalledTimes(1);
      });
    });
  });
});
