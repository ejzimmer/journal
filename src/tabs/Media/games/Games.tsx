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
  bandHue,
  seriesId,
}: {
  games?: Record<string, GameDetails>;
  bandHue?: number;
  seriesId?: string;
}) {
  return (
    <MediaList
      items={games}
      bandHue={bandHue}
      hue={(game) => getCoverHue(seriesId ?? game.title)}
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
            <GameMediaList
              games={item.items}
              bandHue={item.bandHue}
              seriesId={item.id}
            />
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
