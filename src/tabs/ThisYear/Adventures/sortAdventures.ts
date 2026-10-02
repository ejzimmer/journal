import { Adventure } from './types';

const compareDone = (a: Adventure, b: Adventure) =>
  Number(a.isDone) - Number(b.isDone);

const comparePlannedDates = (a: Adventure, b: Adventure) => {
  if (a.plannedDate && b.plannedDate) {
    return Temporal.PlainDate.compare(a.plannedDate, b.plannedDate);
  }
  return Number(!a.plannedDate) - Number(!b.plannedDate);
};

export const sortAdventures = (adventures: Adventure[]) =>
  [...adventures].sort(
    (a, b) => compareDone(a, b) || comparePlannedDates(a, b),
  );
