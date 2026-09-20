import { act } from "@testing-library/react"
import { hoursToMilliseconds, subDays } from "date-fns"
import { DailyJob, useDailyJob } from "./DailyJobsContext"
import { createDailyJobsStorage, renderDailyJob } from "./dailyJobsTestUtils"

const LAST_RUN_KEY = "job-last-run"

describe("daily jobs", () => {
  it("runs a job that hasn't run today", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage({})

    renderDailyJob(() => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }), storage)

    expect(run).toHaveBeenCalledTimes(1)
    expect(storage.setValue).toHaveBeenCalledWith(
      LAST_RUN_KEY,
      expect.any(Number),
    )
  })

  it("runs a job that last ran on an earlier day", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage({
      [LAST_RUN_KEY]: subDays(new Date(), 1).getTime(),
    })

    renderDailyJob(() => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }), storage)

    expect(run).toHaveBeenCalledTimes(1)
  })

  it("doesn't run a job that has already run today", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage({
      [LAST_RUN_KEY]: new Date().getTime(),
    })

    renderDailyJob(() => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }), storage)

    expect(run).not.toHaveBeenCalled()
  })

  it("waits for the last run time to load before running a job", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage(
      {},
      { useValue: () => ({ value: undefined, loading: true }) },
    )

    renderDailyJob(() => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }), storage)

    expect(run).not.toHaveBeenCalled()
  })

  it("runs a job once, however often its component re-renders", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage({})

    const { rerender } = renderDailyJob(
      () => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }),
      storage,
    )
    rerender()
    rerender()

    expect(run).toHaveBeenCalledTimes(1)
  })

  it("waits until a job's data is ready", () => {
    const run = jest.fn()
    const storage = createDailyJobsStorage({})
    let isReady = false

    const { rerender } = renderDailyJob(
      () => useDailyJob({ lastRunKey: LAST_RUN_KEY, isReady, run }),
      storage,
    )
    expect(run).not.toHaveBeenCalled()

    isReady = true
    rerender()

    expect(run).toHaveBeenCalledTimes(1)
  })

  it("runs a job with the most recent version of its data", () => {
    const seenData: string[] = []
    const storage = createDailyJobsStorage({})
    let job: DailyJob = {
      lastRunKey: LAST_RUN_KEY,
      isReady: false,
      run: () => seenData.push("stale data"),
    }

    const { rerender } = renderDailyJob(() => useDailyJob(job), storage)

    job = {
      lastRunKey: LAST_RUN_KEY,
      isReady: true,
      run: () => seenData.push("fresh data"),
    }
    rerender()

    expect(seenData).toEqual(["fresh data"])
  })

  it("runs every registered job", () => {
    const cleanUpTasks = jest.fn()
    const updateTasks = jest.fn()
    const storage = createDailyJobsStorage({})

    renderDailyJob(() => {
      useDailyJob({ lastRunKey: "clean-up-last-run", run: cleanUpTasks })
      useDailyJob({ lastRunKey: "update-last-run", run: updateTasks })
    }, storage)

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

      renderDailyJob(
        () => useDailyJob({ lastRunKey: LAST_RUN_KEY, run }),
        createDailyJobsStorage({}),
      )
      expect(run).toHaveBeenCalledTimes(1)

      act(() => {
        jest.advanceTimersByTime(hoursToMilliseconds(4))
      })

      expect(run).toHaveBeenCalledTimes(2)
    })
  })
})
