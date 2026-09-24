import '../App.css';
import { TopNav } from '../TopNav';
import { AppRoutes } from '../AppRoutes';
import { DailyJobs } from '../DailyJobs';
import { DailyJobsProvider } from '../shared/dailyJobs/DailyJobsContext';

export function App() {
  return (
    <DailyJobsProvider>
      <DailyJobs />
      <TopNav />
      <div className="main-content">
        <AppRoutes />
      </div>
    </DailyJobsProvider>
  );
}
