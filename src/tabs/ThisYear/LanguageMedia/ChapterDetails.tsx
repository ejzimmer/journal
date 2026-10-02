import { ComprehensionCounters } from './ComprehensionForms';
import { DeleteButton } from './DeleteButton';
import { EditChapterForm } from './EditChapterForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { StatusSelect } from './StatusSelect';
import { formatChapterName, formatComprehension, formatStatus } from './format';
import { Chapter, ItemPath } from './types';

export function ChapterDetails({
  chapter,
  path,
}: {
  chapter: Chapter;
  path: ItemPath;
}) {
  const { updateItem } = useLanguageMediaStorage();
  const name = formatChapterName(chapter);

  return (
    <>
      {name}
      {chapter.lastPage !== undefined && ` (to page ${chapter.lastPage})`}
      {formatStatus(chapter.status)}: {formatComprehension(chapter)}
      {chapter.lastPage === undefined && (
        <StatusSelect
          name={name}
          status={chapter.status}
          onChange={(status) => updateItem(path, { status })}
        />
      )}
      <ComprehensionCounters
        name={name}
        comprehension={chapter}
        onChange={(changes) => updateItem(path, changes)}
      />
      <EditChapterForm
        name={name}
        chapter={chapter}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
    </>
  );
}
