import {
  GAME_STATUS_ORDER,
  GameDetails,
  GameStatus,
  getGameStatus,
  SeriesDetails,
} from '../types';
import { getCoverHue } from '../coverHue';
import { MediaList } from '../MediaList';
import { StatusConfig } from '../MediaSpine';
import { useMediaStorage } from '../MediaStorageContext';
import { EditGameForm } from './EditGameForm';

const GAME_CONFIG: StatusConfig<GameDetails, GameStatus> = {
  order: GAME_STATUS_ORDER,
  spineStatus: {
    unplayed: 'todo',
    playing: 'active',
    played: 'done',
  },
  glyph: {
    unplayed: '🎮',
    playing: '🎮',
    played: '✓',
  },
  getStatus: getGameStatus,
  setStatus: (game, status) => ({ ...game, status }),
};

type GameMediaListProps = {
  games?: Record<string, GameDetails>;
  series?: SeriesDetails<GameDetails>;
};

export function GameMediaList({ games, series }: GameMediaListProps) {
  const { reorderSeries, getSeriesItemsPath } = useMediaStorage();

  return (
    <MediaList
      items={games}
      listId={series && getSeriesItemsPath(series)}
      bandHue={series && getCoverHue(series.id)}
      onReorder={series && ((items) => reorderSeries(series, items))}
      hue={(game) => getCoverHue(series?.id ?? game.title)}
      config={GAME_CONFIG}
      EditForm={EditGameForm}
    />
  );
}
