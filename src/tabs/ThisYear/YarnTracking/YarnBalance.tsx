import './YarnBalance.css';
import { useYarnStorage } from './YarnStorageContext';

export function YarnBalance() {
  const { currentBalance } = useYarnStorage();

  return <div className="yarn-balance">{currentBalance.toLocaleString()}g</div>;
}
