import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  compareDates,
  getMillisecondsUntilTomorrow,
  getToday,
  StoredDate,
} from '../dates';
import { useStorageContext } from '../FirebaseContext';

export type DailyJob = {
  lastRunKey: string;
  isReady?: boolean;
  run: () => void;
};

type ScheduledJob = Omit<DailyJob, 'isReady'>;

type RegisterJob = (job: ScheduledJob) => () => void;

const DailyJobsContext = createContext<RegisterJob | undefined>(undefined);

function useToday() {
  const [today, setToday] = useState(() => getToday().toString());

  useEffect(() => {
    const updateToday = () => setToday(getToday().toString());

    const timeout = setTimeout(updateToday, getMillisecondsUntilTomorrow());
    document.addEventListener('visibilitychange', updateToday);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', updateToday);
    };
  }, [today]);

  return today;
}

export function DailyJobsProvider({ children }: { children: ReactNode }) {
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const today = useToday();

  const registerJob = useCallback((job: ScheduledJob) => {
    setJobs((jobs) => [
      ...jobs.filter((other) => other.lastRunKey !== job.lastRunKey),
      job,
    ]);

    const unregisterJob = () =>
      setJobs((jobs) => jobs.filter((other) => other !== job));

    return unregisterJob;
  }, []);

  return (
    <DailyJobsContext.Provider value={registerJob}>
      {jobs.map((job) => (
        <DailyJobRunner key={job.lastRunKey} job={job} today={today} />
      ))}
      {children}
    </DailyJobsContext.Provider>
  );
}

function DailyJobRunner({ job, today }: { job: ScheduledJob; today: string }) {
  const { useValue, setValue } = useStorageContext();
  const { value: lastRun, loading } = useValue<StoredDate>(job.lastRunKey);
  const dayRunInThisSession = useRef<string>(undefined);

  useEffect(() => {
    if (loading) return;

    const alreadyRunThisSession = dayRunInThisSession.current === today;
    const alreadyRunToday =
      lastRun !== undefined && compareDates(lastRun, today) >= 0;
    if (alreadyRunThisSession || alreadyRunToday) return;

    dayRunInThisSession.current = today;
    job.run();
    setValue(job.lastRunKey, today);
  }, [job, today, lastRun, loading, setValue]);

  return null;
}

function useRegisterJob(): RegisterJob {
  const registerJob = useContext(DailyJobsContext);
  if (!registerJob) {
    throw new Error('Daily jobs context not found');
  }

  return registerJob;
}

export function useDailyJob({ lastRunKey, isReady = true, run }: DailyJob) {
  const registerJob = useRegisterJob();
  // run belongs in the effect's deps, but it isn't memoised, so depending on
  // it would re-register the job on every render. The ref keeps it out of the
  // deps without the effect closing over a stale version
  const runWithCurrentData = useRef(run);
  runWithCurrentData.current = run;

  useEffect(() => {
    if (!isReady) return;

    const unregisterJob = registerJob({
      lastRunKey,
      run: () => runWithCurrentData.current(),
    });

    return unregisterJob;
  }, [registerJob, lastRunKey, isReady]);
}
