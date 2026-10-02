import { ChapterDetails } from './ChapterDetails';
import { formatVolumeName } from './format';
import { listByNumber } from './lists';
import { PrintSeries } from './types';

export function PrintSeriesDetails({ series }: { series: PrintSeries }) {
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
            {formatVolumeName(volume)}
            {volume.pages !== undefined && ` (${volume.pages} pages)`}
            <ul>
              {listByNumber(volume.chapters).map((chapter) => (
                <li key={chapter.id}>
                  <ChapterDetails chapter={chapter} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
