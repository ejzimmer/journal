import { Chapter, Comprehension, Episode, Status, Volume } from './types';

const minutesAndSecondsFormat = new Intl.DurationFormat(undefined, {
  style: 'digital',
  hoursDisplay: 'auto',
});

const hoursMinutesAndSecondsFormat = new Intl.DurationFormat(undefined, {
  style: 'digital',
  hours: '2-digit',
});

const toDuration = (totalSeconds: number) =>
  Temporal.Duration.from({ seconds: totalSeconds }).round({
    largestUnit: 'hours',
  });

export const formatMinutesAndSeconds = (totalSeconds: number) =>
  minutesAndSecondsFormat.format(toDuration(totalSeconds));

export const formatHoursMinutesAndSeconds = (totalSeconds: number) =>
  hoursMinutesAndSecondsFormat.format(toDuration(totalSeconds));

export const STATUS_NAMES: Record<Status, string> = {
  'not-started': 'Not started',
  'in-progress': 'In progress',
  done: 'Done',
};

export const formatEpisodeName = ({ number, name }: Episode) =>
  name || `Episode ${number}`;

export const formatChapterName = ({ number, name }: Chapter) =>
  name || `Chapter ${number}`;

export const formatVolumeName = ({ number, name }: Volume) =>
  name || `Volume ${number}`;

export function formatComprehension({
  lookups,
  aiQuestions,
  understood,
}: Comprehension) {
  const counts = `${lookups} looked up, ${aiQuestions} asked AI`;
  return understood === undefined
    ? counts
    : `${counts}, ${understood}% understood`;
}
