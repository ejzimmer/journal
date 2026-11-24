import { AuthGate } from 'shared/AuthGate';
import { HomePage } from './HomePage';
import { Loading } from 'shared/loading';

export function App() {
  return (
    <AuthGate loadingIndicator={<Loading stroke="white" />}>
      <HomePage />
    </AuthGate>
  );
}
