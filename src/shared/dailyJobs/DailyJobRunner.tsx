import { useEffect, useRef } from 'react';
import { useStorageContext } from '../FirebaseContext';
import { hasAlreadyRun } from './hasAlreadyRun';
import { ScheduledJob } from './DailyJobsContext';

type DailyJobRunnerProps = { job: ScheduledJob; today: string };

export function DailyJobRunner({ job, today }: DailyJobRunnerProps) {
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
