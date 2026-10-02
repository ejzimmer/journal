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
              path={[...path, 'volumes', volume.id]}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
