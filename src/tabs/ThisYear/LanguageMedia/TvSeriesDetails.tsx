import { AddSeasonForm } from './AddSeasonForm';
import { useLanguageMediaStorage } from './LanguageMediaStorageContext';
import { SeasonDetails } from './SeasonDetails';
import { TvSeriesUpToForm } from './TvSeriesUpToForm';
import { formatMinutesAndSeconds } from './format';
import { getItemsByNumber } from './lists';
import { ItemPath, TvSeries } from './types';

export function TvSeriesDetails({
  series,
  path,
}: {
  series: TvSeries;
  path: ItemPath;
}) {
  const { addItem, updateItem } = useLanguageMediaStorage();

  return (
    <>
      <div>
        {series.upTo && (
          <>
            Up to {series.upTo.season}-{series.upTo.episode}-
            {formatMinutesAndSeconds(series.upTo.timestampInSeconds)}
          </>
        )}
        <TvSeriesUpToForm
          upTo={series.upTo}
          onChange={(upTo) => updateItem(path, { upTo })}
        />
      </div>
      <ul>
        {getItemsByNumber(series.seasons).map((season) => (
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
