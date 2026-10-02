import { EpisodeDetails } from './EpisodeDetails';
import { formatMinutesAndSeconds } from './format';
import { listByNumber } from './lists';
import { TvSeries } from './types';

export function TvSeriesDetails({ series }: { series: TvSeries }) {
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
            Season {season.number}
            <ul>
              {listByNumber(season.episodes).map((episode) => (
                <li key={episode.id}>
                  <EpisodeDetails episode={episode} />
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </>
  );
}
