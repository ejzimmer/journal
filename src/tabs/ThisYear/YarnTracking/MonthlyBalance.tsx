import { BallOfYarnIcon } from '../../../shared/icons/BallOfYarn';
import { Month } from './types';
import { GRAMS_PER_BALL, getBallSizes } from './utils';

export function MonthlyBalance({ total, subTotals }: Month) {
  const yarnTypes = Object.keys(subTotals);

  return (
    <div className="yarn-month">
      {yarnTypes.map((yarnType) => (
        <YarnTypeBalls
          key={yarnType}
          yarnType={yarnType}
          amount={subTotals[yarnType]}
          monthTotal={total}
        />
      ))}
    </div>
  );
}

function YarnTypeBalls({
  yarnType,
  amount,
  monthTotal,
}: {
  yarnType: string;
  amount: number;
  monthTotal: number;
}) {
  const ballSizes = getBallSizes(amount);
  const ballsWide = amount / GRAMS_PER_BALL;

  return (
    <div
      className="yarn-type"
      style={{ width: `${(amount / monthTotal) * 100}%` }}
      role="img"
      aria-label={`${yarnType}: ${amount.toLocaleString()}g`}
    >
      <div className="details">
        {yarnType}: {amount.toLocaleString()}g
      </div>
      {ballSizes.map((size, index) => (
        <div
          key={index}
          className="ball"
          data-testid="yarn-ball"
          style={{ width: `${(size / ballsWide) * 100}%` }}
        >
          <BallOfYarnIcon />
        </div>
      ))}
    </div>
  );
}
