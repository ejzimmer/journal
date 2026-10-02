import { AddVolumeForm } from './AddVolumeForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { VolumeDetails } from './VolumeDetails';
import { listByNumber } from './lists';
import { ItemPath, PrintSeries } from './types';

export function PrintSeriesDetails({
  series,
  path,
}: {
  series: PrintSeries;
  path: ItemPath;
}) {
  const { addItem } = useLanguageMediaStorage();

  return (
    <>
      {series.upTo && (
        <div>
          Up to {series.upTo.volume}-{series.upTo.chapter}-{series.upTo.page}
        </div>
      )}
      <ul>
        {listByNumber(series.volumes).map((volume) => (
          <li key={volume.id}>
            <VolumeDetails
              volume={volume}
              isNameRequired={series.type === 'book'}
              path={[...path, 'volumes', volume.id]}
            />
          </li>
        ))}
      </ul>
      <AddVolumeForm
        volumes={series.volumes}
        isNameRequired={series.type === 'book'}
        onAdd={(volume) => addItem([...path, 'volumes'], volume)}
      />
    </>
  );
}
