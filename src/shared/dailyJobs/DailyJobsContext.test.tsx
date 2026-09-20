import { act } from "@testing-library/react"
import { subDays } from "date-fns"
import { ContextType, FirebaseContext } from "../FirebaseContext"
import { DailyJob, DailyJobsProvider, useDailyJob } from "./DailyJobsContext"
import { createDailyJobsStorage, renderDailyJobs } from "./dailyJobsTestUtils"

const LAST_RUN_KEY = "job-last-run"

function TestJob(job: DailyJob) {
  useDailyJob(job)
  return null
}

function renderJob(job: DailyJob, storage: ContextType) {
  const view = renderDailyJobs(<TestJob {...job} />, storage)

  return {
    ...view,
    rerenderJob: (updatedJob: DailyJob) =>
      view.rerender(
        <FirebaseContext.Provider value={storage}>
          <DailyJobsProvider>
            <TestJob {...updatedJob} />
          </DailyJobsProvider>
        </FirebaseContext.Provider>,
      ),
  }
}

describe("daily jobs", () => {
  it("runs a job that hasn't run today", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage()

    renderJob({ lastRunKey: LAST_RUN_KEY, run }, storage)

    expect(run).toHaveBeenCalledTimes(1)
    expect(storage.setValue).toHaveBeenCalledWith(
      LAST_RUN_KEY,
      expect.any(Number),
    )
  })

  it("runs a job that last ran on an earlier day", () => {
    const run = jest.fn()

    renderJob(
      { lastRunKey: LAST_RUN_KEY, run },
      createDailyJobsStorage({ [LAST_RUN_KEY]: subDays(new Date(), 1).getTime() }),
    )

    expect(run).toHaveBeenCalledTimes(1)
  })

  it("doesn't run a job that has already run today", () => {
    const run = jest.fn()

    renderJob(
      { lastRunKey: LAST_RUN_KEY, run },
      createDailyJobsStorage({ [LAST_RUN_KEY]: new Date().getTime() }),
    )

    expect(run).not.toHaveBeenCalled()
  })

  it("waits for the last run time to load before running a job", () => {
    const run = jest.fn()

    renderJob(
      { lastRunKey: LAST_RUN_KEY, run },
      createDailyJobsStorage({}, { useValue: () => ({ value: undefined, loading: true }) }),
    )

    expect(run).not.toHaveBeenCalled()
  })

  it("runs a job once, however often its component re-renders", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage()

    const { rerenderJob } = renderJob({ lastRunKey: LAST_RUN_KEY, run }, storage)
    rerenderJob({ lastRunKey: LAST_RUN_KEY, run })
    rerenderJob({ lastRunKey: LAST_RUN_KEY, run })

    expect(run).toHaveBeenCalledTimes(1)
  })

  it("waits until a job's data is ready", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage()

    const { rerenderJob } = renderJob(
      { lastRunKey: LAST_RUN_KEY, isReady: false, run },
      storage,
    )
    expect(run).not.toHaveBeenCalled()

    rerenderJob({ lastRunKey: LAST_RUN_KEY, isReady: true, run })

    expect(run).toHaveBeenCalledTimes(1)
  })

  it("runs a job with the most recent version of its data", () => {
    const seenData: string[] = []
    const storage = createDailyJobsStorage()

    const { rerenderJob } = renderJob(
      {
        lastRunKey: LAST_RUN_KEY,
        isReady: false,
        run: () => seenData.push("stale data"),
      },
      storage,
    )

    rerenderJob({
      lastRunKey: LAST_RUN_KEY,
      isReady: true,
      run: () => seenData.push("fresh data"),
    })

    expect(seenData).toEqual(["fresh data"])
  })

  it("runs every registered job", () => {
    const cleanUpTasks = jest.fn()
    const updateTasks = jest.fn()
    const storage = createDailyJobsStorage()

    renderDailyJobs(
      <>
        <TestJob lastRunKey="clean-up-last-run" run={cleanUpTasks} />
        <TestJob lastRunKey="update-last-run" run={updateTasks} />
      </>,
      storage,
    )

    expect(cleanUpTasks).toHaveBeenCalledTimes(1)
    expect(updateTasks).toHaveBeenCalledTimes(1)
  })

  describe("when the app is left open overnight", () => {
    beforeEach(() => {
      jest.useFakeTimers()
      jest.setSystemTime(new Date("2026-09-19T22:00:00"))
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it("runs each job again on the new day", () => {
      const run = jest.fn()

      renderJob({ lastRunKey: LAST_RUN_KEY, run }, createDailyJobsStorage())
      expect(run).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(3 * 60 * 60 * 1000)
      })

      expect(run).toHaveBeenCalledTimes(2)
    })

    it("doesn't run a job again later on the same day", () => {
      const run = jest.fn()

      renderJob({ lastRunKey: LAST_RUN_KEY, run }, createDailyJobsStorage())

      act(() => {
        jest.advanceTimersByTime(60 * 60 * 1000)
      })

      expect(run).toHaveBeenCalledTimes(1)
    })
  })
})
