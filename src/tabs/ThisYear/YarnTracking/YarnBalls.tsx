import { BallOfYarnIcon } from '../../../shared/icons/BallOfYarn';
import { getBallSizes } from './utils';

type YarnBallsProps = {
  yarnType: string;
  amount: number;
};

export function YarnBalls({ yarnType, amount }: YarnBallsProps) {
  const label = `${yarnType}: ${amount.toLocaleString()}g`;

  return (
    <div
      className="yarn-type"
      data-yarn-type={yarnType}
      role="img"
      aria-label={label}
    >
      <div className="details">{label}</div>
      {getBallSizes(amount).map((size, index) => (
        <div
          key={index}
          className="ball"
          data-testid="yarn-ball"
          style={{ width: `calc(var(--ball-size) * ${size})` }}
        >
          <BallOfYarnIcon />
        </div>
      ))}
    </div>
  );
}
