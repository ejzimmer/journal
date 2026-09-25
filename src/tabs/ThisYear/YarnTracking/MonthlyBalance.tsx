import { Month } from './types';
import { YarnBalls } from './YarnBalls';

export function MonthlyBalance({ subTotals }: Month) {
  const yarnTypes = Object.keys(subTotals);

  return (
    <div className="yarn-month">
      {yarnTypes.map((yarnType) => (
        <YarnBalls
          key={yarnType}
          yarnType={yarnType}
          amount={subTotals[yarnType]}
        />
      ))}
    </div>
  );
}
