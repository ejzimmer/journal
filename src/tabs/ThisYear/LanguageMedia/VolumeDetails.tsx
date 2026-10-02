import { AddChapterForm } from './AddChapterForm';
import { ChapterDetails } from './ChapterDetails';
import { DeleteButton } from './DeleteButton';
import { EditVolumeForm } from './EditVolumeForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { formatVolumeName } from './format';
import { listByNumber } from './lists';
import { ItemPath, Volume } from './types';

export function VolumeDetails({
  volume,
  path,
  isNameRequired,
}: {
  volume: Volume;
  path: ItemPath;
  isNameRequired: boolean;
}) {
  const { addItem, updateItem } = useLanguageMediaStorage();
  const name = formatVolumeName(volume);

  return (
    <>
      {name}
      {volume.pages !== undefined && ` (${volume.pages} pages)`}
      <EditVolumeForm
        name={name}
        volume={volume}
        isNameRequired={isNameRequired}
        onChange={(changes) => updateItem(path, changes)}
      />
      <DeleteButton name={name} path={path} />
      <ul>
        {listByNumber(volume.chapters).map((chapter) => (
          <li key={chapter.id}>
            <ChapterDetails
              chapter={chapter}
              path={[...path, 'chapters', chapter.id]}
            />
          </li>
        ))}
      </ul>
      <AddChapterForm
        chapters={volume.chapters}
        onAdd={(chapter) => addItem([...path, 'chapters'], chapter)}
      />
    </>
  );
}
