import { AuthGate } from 'shared/AuthGate';
import { HomePage } from './HomePage';

export function App() {
  return (
    <AuthGate>
      <HomePage />
    </AuthGate>
  );
}
