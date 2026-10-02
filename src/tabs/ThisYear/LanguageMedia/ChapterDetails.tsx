import { DeleteButton } from './DeleteButton';
import { formatChapterName, formatComprehension, formatStatus } from './format';
import { Chapter, ItemPath } from './types';

export function ChapterDetails({
  chapter,
  path,
}: {
  chapter: Chapter;
  path: ItemPath;
}) {
  const name = formatChapterName(chapter);

  return (
    <>
      {name}
      {chapter.lastPage !== undefined && ` (to page ${chapter.lastPage})`}
      {formatStatus(chapter.status)}: {formatComprehension(chapter)}
      <DeleteButton name={name} path={path} />
    </>
  );
}
