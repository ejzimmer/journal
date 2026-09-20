import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { isBefore, minutesToMilliseconds, startOfDay } from "date-fns"
import { useStorageContext } from "../FirebaseContext"

export type DailyJob = {
  lastRunKey: string
  isReady?: boolean
  run: () => void
}

type RegisteredJob = Omit<DailyJob, "isReady">

type RegisterJob = (job: RegisteredJob) => () => void

const DailyJobsContext = createContext<RegisterJob | undefined>(undefined)

const NEW_DAY_CHECK_INTERVAL = minutesToMilliseconds(1)

function useToday() {
  const [today, setToday] = useState(() => startOfDay(new Date()).getTime())

  useEffect(() => {
    const checkForNewDay = () => setToday(startOfDay(new Date()).getTime())

    const interval = setInterval(checkForNewDay, NEW_DAY_CHECK_INTERVAL)
    document.addEventListener("visibilitychange", checkForNewDay)

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", checkForNewDay)
    }
  }, [])

  return today
}

export function DailyJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<Record<string, RegisteredJob>>({})
  const today = useToday()

  const registerJob = useCallback((job: RegisteredJob) => {
    setJobs((registered) => ({ ...registered, [job.lastRunKey]: job }))

    return () =>
      setJobs((registered) => {
        if (registered[job.lastRunKey] !== job) return registered

        const { [job.lastRunKey]: unregistered, ...rest } = registered
        return rest
      })
  }, [])

  return (
    <DailyJobsContext.Provider value={registerJob}>
      {Object.values(jobs).map((job) => (
        <DailyJobRunner key={job.lastRunKey} job={job} today={today} />
      ))}
      {children}
    </DailyJobsContext.Provider>
  )
}

function DailyJobRunner({ job, today }: { job: RegisteredJob; today: number }) {
  const { useValue, setValue } = useStorageContext()
  const { value: lastRun, loading } = useValue<number>(job.lastRunKey)
  const lastRunDay = useRef<number>(undefined)

  useEffect(() => {
    if (loading) return
    if (lastRunDay.current === today) return
    if (lastRun !== undefined && !isBefore(lastRun, today)) return

    lastRunDay.current = today
    job.run()
    setValue(job.lastRunKey, new Date().getTime())
  }, [job, today, lastRun, loading, setValue])

  return null
}

function useRegisterJob(): RegisterJob {
  const registerJob = useContext(DailyJobsContext)
  if (!registerJob) {
    throw new Error("Daily jobs context not found")
  }

  return registerJob
}

export function useDailyJob({ lastRunKey, isReady = true, run }: DailyJob) {
  const registerJob = useRegisterJob()
  const latestRun = useRef(run)
  latestRun.current = run

  useEffect(() => {
    if (!isReady) return

    return registerJob({
      lastRunKey,
      run: () => latestRun.current(),
    })
  }, [registerJob, lastRunKey, isReady])
}
