import { CSSProperties } from 'react';
import { useTooltipPopover } from '../../../shared/useTooltipPopover';
import { Balance, getWeekClass, getWeekLowestShare } from '../utils';

type WeekBarProps = {
  week: Required<Balance>;
  lowestBalance: number;
  heightScale: number;
};

export function WeekBar({ week, lowestBalance, heightScale }: WeekBarProps) {
  const { triggerProps, tooltipProps } = useTooltipPopover();
  const label = `${week.day} ${week.month}: ${week.balance.toLocaleString()}`;

  return (
    <div className="week-container">
      <div
        className={getWeekClass({ balance: week.balance, lowestBalance })}
        style={
          {
            height: (week.balance / heightScale) * 100 + '%',
            '--lowest-share': `${getWeekLowestShare({ balance: week.balance, lowestBalance }) * 100}%`,
          } as CSSProperties
        }
        role="img"
        aria-label={label}
        {...triggerProps}
      />
      <div className="tooltip hovertext" {...tooltipProps}>
        {label}
      </div>
    </div>
  );
}
