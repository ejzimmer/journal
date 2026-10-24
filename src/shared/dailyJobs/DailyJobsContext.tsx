import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { getMillisecondsUntilTomorrow, getToday } from '../dates';
import { useStorageContext } from '../FirebaseContext';
import { hasAlreadyRun } from './hasAlreadyRun';

export type DailyJob = {
  lastRunKey: string;
  isReady?: boolean;
  run: () => void;
};

type ScheduledJob = Omit<DailyJob, 'isReady'>;

type RegisterJob = (job: ScheduledJob) => () => void;

const DailyJobsContext = createContext<RegisterJob | undefined>(undefined);

function useToday() {
  const [today, setToday] = useState(getToday);

  useEffect(() => {
    const updateToday = () => setToday(getToday());

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
  const { useValue, claimDailyRun } = useStorageContext();
  const { value: lastRun, synced } = useValue<string>(job.lastRunKey);
  const dayRunInThisSession = useRef<string>(undefined);

  useEffect(() => {
    if (!synced) return;
    if (dayRunInThisSession.current === today || hasAlreadyRun(lastRun, today))
      return;

    dayRunInThisSession.current = today;
    void claimDailyRun(job.lastRunKey, today).then((claimed) => {
      if (claimed) job.run();
    });
  }, [job, today, lastRun, synced, claimDailyRun]);

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
