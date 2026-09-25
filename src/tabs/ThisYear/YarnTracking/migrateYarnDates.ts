import { Yarn, YarnType } from './types';

const TWO_DIGIT_YEAR_MONTH = /^(\d{2})-(\d{2})$/;

export const hasTwoDigitYearMonths = (yarn: Yarn) =>
  Object.values(yarn).some(({ history }) =>
    Object.keys(history).some((month) => TWO_DIGIT_YEAR_MONTH.test(month)),
  );

const convertMonthId = (monthId: string) => {
  const twoDigitYear = monthId.match(TWO_DIGIT_YEAR_MONTH);

  return twoDigitYear
    ? Temporal.PlainYearMonth.from({
        year: 2000 + Number(twoDigitYear[1]),
        month: Number(twoDigitYear[2]),
      }).toString()
    : monthId;
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
