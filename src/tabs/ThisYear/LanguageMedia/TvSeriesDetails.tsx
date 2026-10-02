import { SeasonDetails } from './SeasonDetails';
import { formatMinutesAndSeconds } from './format';
import { listByNumber } from './lists';
import { ItemPath, TvSeries } from './types';

export function TvSeriesDetails({
  series,
  path,
}: {
  series: TvSeries;
  path: ItemPath;
}) {
  return (
    <>
      {series.upTo && (
        <div>
          Up to {series.upTo.season}-{series.upTo.episode}-
          {formatMinutesAndSeconds(series.upTo.timestampInSeconds)}
        </div>
      )}
      <ul>
        {listByNumber(series.seasons).map((season) => (
          <li key={season.id}>
            <SeasonDetails
              season={season}
              path={[...path, 'seasons', season.id]}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
