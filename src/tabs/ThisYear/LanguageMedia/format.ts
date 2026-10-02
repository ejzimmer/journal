import { Chapter, Comprehension, Episode, Status, Volume } from './types';

const padTwoDigits = (value: number) => String(value).padStart(2, '0');

export function formatMinutesAndSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  return `${padTwoDigits(minutes)}:${padTwoDigits(totalSeconds % 60)}`;
}

export function formatHoursMinutesAndSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  return `${padTwoDigits(hours)}:${formatMinutesAndSeconds(totalSeconds % 3600)}`;
}

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

export const parseDuration = (duration: string) =>
  duration
    .split(':')
    .reduce((totalSeconds, part) => totalSeconds * 60 + Number(part), 0);
