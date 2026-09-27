import './YarnBalance.css';
import { useYarnStorage } from './YarnStorageContext';

export function YarnBalance({ year }: { year: number }) {
  const { currentBalance } = useYarnStorage(year);

  return <div className="yarn-balance">{currentBalance.toLocaleString()}g</div>;
}
