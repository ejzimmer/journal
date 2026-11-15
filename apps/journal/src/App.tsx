import './App.css';
import { AuthGate } from 'shared/AuthGate';
import { TopNav } from './TopNav';
import { AppRoutes } from './AppRoutes';
import { DailyJobs } from './DailyJobs';
import { DailyJobsProvider } from 'shared/dailyJobs/DailyJobsContext';

export function App() {
  return (
    <AuthGate>
      <DailyJobsProvider>
        <DailyJobs />
        <TopNav />
        <div className="main-content">
          <AppRoutes />
        </div>
      </DailyJobsProvider>
    </AuthGate>
  );
}
