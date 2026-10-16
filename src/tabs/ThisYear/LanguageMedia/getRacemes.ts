import { calculateEpisodeUpdatePosition } from './calculateEpisodeUpdatePosition';
import { readEpisodeProgress } from './episodeProgress';
import { getEpisodeUpdates } from './getEpisodeUpdates';
import { TvSeries } from './types';
import { getVineEpisodes } from './vineLayout';

export type Raceme = {
  key: string;
  shootKey: string;
  at: number;
  understood: number;
};

export function getRacemes(series: TvSeries): Raceme[] {
  return getVineEpisodes(series).flatMap(({ season, episodes }) =>
    episodes.flatMap((episode) => {
      const progress = readEpisodeProgress(series, season, episode);
      if (!progress) return [];
      return getEpisodeUpdates(episode).flatMap((update) =>
        update.understood === undefined
          ? []
          : [
              {
                key: update.key,
                shootKey: `${season.id}-${episode.id}-shoot`,
                at: calculateEpisodeUpdatePosition(episode, update, progress),
                understood: update.understood,
              },
            ],
      );
    }),
  );
}
