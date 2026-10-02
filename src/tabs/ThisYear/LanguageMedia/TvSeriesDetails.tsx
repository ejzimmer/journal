import { AddSeasonForm } from './AddSeasonForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
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
  const { addItem } = useLanguageMediaStorage();

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
      <AddSeasonForm
        seasons={series.seasons}
        onAdd={(season, episodes) => {
          const seasonId = addItem([...path, 'seasons'], season);
          if (!seasonId) return;
          episodes.forEach((episode) =>
            addItem([...path, 'seasons', seasonId, 'episodes'], episode),
          );
        }}
      />
    </>
  );
}
