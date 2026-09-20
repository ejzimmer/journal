import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { addDays, isBefore, startOfDay } from "date-fns"
import { useStorageContext } from "../FirebaseContext"

export type DailyJob = {
  lastRunKey: string
  isReady?: boolean
  run: () => void
}

type ScheduledJob = Omit<DailyJob, "isReady">

type RegisterJob = (job: ScheduledJob) => () => void

const DailyJobsContext = createContext<RegisterJob | undefined>(undefined)

function useToday() {
  const [today, setToday] = useState(() => startOfDay(new Date()).getTime())

  useEffect(() => {
    const updateToday = () => setToday(startOfDay(new Date()).getTime())

    const millisecondsUntilTomorrow = addDays(today, 1).getTime() - Date.now()
    const timeout = setTimeout(updateToday, millisecondsUntilTomorrow)
    document.addEventListener("visibilitychange", updateToday)

    return () => {
      clearTimeout(timeout)
      document.removeEventListener("visibilitychange", updateToday)
    }
  }, [today])

  return today
}

export function DailyJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const today = useToday()

  const registerJob = useCallback((job: ScheduledJob) => {
    setJobs((jobs) => [
      ...jobs.filter((other) => other.lastRunKey !== job.lastRunKey),
      job,
    ])

    const unregisterJob = () =>
      setJobs((jobs) => jobs.filter((other) => other !== job))

    return unregisterJob
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

function DailyJobRunner({ job, today }: { job: ScheduledJob; today: number }) {
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
  // the job is registered once, so it reads its callback from a ref to run
  // against the data from the latest render rather than the one it registered on
  const runWithCurrentData = useRef(run)
  runWithCurrentData.current = run

  useEffect(() => {
    if (!isReady) return

    const unregisterJob = registerJob({
      lastRunKey,
      run: () => runWithCurrentData.current(),
    })

    return unregisterJob
  }, [registerJob, lastRunKey, isReady])
}
