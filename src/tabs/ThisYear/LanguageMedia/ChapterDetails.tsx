import { formatChapterName, formatComprehension, formatStatus } from './format';
import { Chapter } from './types';

export function ChapterDetails({ chapter }: { chapter: Chapter }) {
  return (
    <>
      {formatChapterName(chapter)}
      {chapter.lastPage !== undefined && ` (to page ${chapter.lastPage})`}
      {formatStatus(chapter.status)}: {formatComprehension(chapter)}
    </>
  );
}
