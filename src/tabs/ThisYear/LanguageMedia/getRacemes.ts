import { calculateEpisodeUpdatePosition } from './calculateEpisodeUpdatePosition';
import { calculateEpisodeProgress } from './calculateEpisodeProgress';
import { getEpisodeUpdates } from './getEpisodeUpdates';
import { TvSeries } from './types';
import { getVineEpisodes } from './vineLayout';

export type Raceme = {
  key: string;
  shootKey: string;
  at: number;
  understood?: number;
  date: string;
};

export function getRacemes(series: TvSeries): Raceme[] {
  return getVineEpisodes(series).flatMap(({ season, episodes }) =>
    episodes.flatMap((episode) => {
      const progress = calculateEpisodeProgress(series, season, episode);
      if (!progress) return [];
      return getEpisodeUpdates(episode).map((update) => ({
        key: update.key,
        shootKey: `${season.id}-${episode.id}-shoot`,
        at: calculateEpisodeUpdatePosition(episode, update, progress),
        understood: update.understood,
        date: update.at,
      }));
    }),
  );
}
