import type { Yarn, YarnType } from './types';

const convertMonthId = (monthId: string) => {
  const twoDigitYear = monthId.match(/^(\d{2})-(\d{2})$/);

  return twoDigitYear
    ? Temporal.PlainYearMonth.from({
        year: 2000 + Number(twoDigitYear[1]),
        month: Number(twoDigitYear[2]),
      }).toString()
    : Temporal.PlainYearMonth.from(monthId).toString();
};

const migrateYarnType = ({ id, history }: YarnType): YarnType => ({
  id,
  history: Object.fromEntries(
    Object.entries(history).map(([month, balance]) => [
      convertMonthId(month),
      balance,
    ]),
  ),
});

export const migrateYarnDates = (yarn: Yarn): Yarn =>
  Object.fromEntries(
    Object.entries(yarn).map(([key, yarnType]) => [
      key,
      migrateYarnType(yarnType),
    ]),
  );
