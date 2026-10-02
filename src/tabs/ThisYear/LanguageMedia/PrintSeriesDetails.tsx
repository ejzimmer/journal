import { AddVolumeForm } from './AddVolumeForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { PrintSeriesUpToForm } from './PrintSeriesUpToForm';
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
  const { addItem, updateItem } = useLanguageMediaStorage();

  return (
    <>
      <div>
        {series.upTo && (
          <>
            Up to {series.upTo.volume}-{series.upTo.page}
          </>
        )}
        <PrintSeriesUpToForm
          upTo={series.upTo}
          onChange={(upTo) => updateItem(path, { upTo })}
        />
      </div>
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
