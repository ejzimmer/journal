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
  const [jobs, setJobs] = useState<RegisteredJob[]>([])
  const today = useToday()

  const registerJob = useCallback((job: RegisteredJob) => {
    setJobs((jobs) => [
      ...jobs.filter((other) => other.lastRunKey !== job.lastRunKey),
      job,
    ])

    return () => setJobs((jobs) => jobs.filter((other) => other !== job))
  }, [])

  return (
    <DailyJobsContext.Provider value={registerJob}>
      {jobs.map((job) => (
        <DailyJobRunner key={job.lastRunKey} job={job} today={today} />
      ))}
      {children}
    </DailyJobsContext.Provider>
  )
}

function DailyJobRunner({ job, today }: { job: RegisteredJob; today: number }) {
  const { useValue, setValue } = useStorageContext()
  const { value: lastRun, loading } = useValue<number>(job.lastRunKey)
  const dayRunInThisSession = useRef<number>(undefined)

  useEffect(() => {
    if (loading) return

    const alreadyRunThisSession = dayRunInThisSession.current === today
    const alreadyRunToday = lastRun !== undefined && !isBefore(lastRun, today)
    if (alreadyRunThisSession || alreadyRunToday) return

    dayRunInThisSession.current = today
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
  const runWithCurrentData = useRef(run)
  runWithCurrentData.current = run

  useEffect(() => {
    if (!isReady) return

    return registerJob({
      lastRunKey,
      run: () => runWithCurrentData.current(),
    })
  }, [registerJob, lastRunKey, isReady])
}
