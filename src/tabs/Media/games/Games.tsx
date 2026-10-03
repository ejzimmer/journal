import {
  GAME_STATUS_ORDER,
  GameDetails,
  GameStatus,
  getGameStatus,
  isSeries,
  SeriesDetails,
} from '../types';
import { getCoverHue } from '../coverHue';
import { MediaList } from '../MediaList';
import { MediaEditFormProps, StatusConfig } from '../MediaSpine';
import { AddMediaForm, EditMediaForm } from '../MediaForm';
import { useGameFormConfig } from './gameFormConfig';
import { Shelf } from '../Shelf';
import { useMediaStorage } from '../MediaStorageContext';

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

function EditGameForm({
  item,
  isOpen,
  onCancel,
}: MediaEditFormProps<GameDetails>) {
  return (
    <EditMediaForm
      item={item}
      isOpen={isOpen}
      onCancel={onCancel}
      config={useGameFormConfig()}
    />
  );
}

function GameMediaList({
  games,
  series,
}: {
  games?: Record<string, GameDetails>;
  series?: SeriesDetails<GameDetails>;
}) {
  const { reorderSeries, getSeriesItemsPath } = useMediaStorage();

  return (
    <MediaList
      items={games}
      reorderListId={series && getSeriesItemsPath(series)}
      bandHue={series?.bandHue}
      onReorder={series && ((items) => reorderSeries(series, items))}
      hue={(game) => getCoverHue(series?.id ?? game.title)}
      config={GAME_CONFIG}
      EditForm={EditGameForm}
    />
  );
}

export function Games() {
  const { games, updateMediaSeries } = useMediaStorage();

  const series = games.filter((item): item is SeriesDetails<GameDetails> =>
    isSeries(item),
  );
  const singleGames = games.filter(
    (item): item is GameDetails => !isSeries(item),
  );

  return (
    <div className="games">
      <h2>Games</h2>
      <div className="shelves">
        {series.map((item) => (
          <Shelf
            key={item.id}
            label={item.name}
            onRenameLabel={(name) => updateMediaSeries(item, name)}
          >
            <GameMediaList games={item.items} series={item} />
          </Shelf>
        ))}
        {singleGames.map((game) => (
          <Shelf key={game.id} single>
            <GameMediaList games={{ [game.id]: game }} />
          </Shelf>
        ))}
      </div>
      <AddMediaForm ariaLabel="Add a game" config={useGameFormConfig()} />
    </div>
  );
}
