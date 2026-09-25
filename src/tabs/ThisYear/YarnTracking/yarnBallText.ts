import { YarnBall } from './types';
import { formatMonthAndYear } from '../../../shared/dates';

export const getBallLabel = ({ yarnType, grams, usedIn }: YarnBall) =>
  `${usedIn ? 'used ' : ''}${yarnType}: ${grams}g`;

export const getBallDetails = (
  { yarnType, grams, usedIn }: YarnBall,
  balance: number,
) =>
  usedIn
    ? `${yarnType}: ${grams}g, used ${formatMonthAndYear(usedIn)}`
    : `${yarnType}: ${balance.toLocaleString()}g`;
