import { ChapterDetails } from './ChapterDetails';
import { DeleteButton } from './DeleteButton';
import { formatVolumeName } from './format';
import { listByNumber } from './lists';
import { ItemPath, Volume } from './types';

export function VolumeDetails({
  volume,
  path,
}: {
  volume: Volume;
  path: ItemPath;
}) {
  const name = formatVolumeName(volume);

  return (
    <>
      {name}
      {volume.pages !== undefined && ` (${volume.pages} pages)`}
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
    </>
  );
}
