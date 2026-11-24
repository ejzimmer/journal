import { AuthGate } from 'shared/AuthGate';
import { HomePage } from './HomePage';
import { YarnLoading } from './YarnLoading';

export function App() {
  return (
    <AuthGate loadingIndicator={<YarnLoading />}>
      <HomePage />
    </AuthGate>
  );
}
