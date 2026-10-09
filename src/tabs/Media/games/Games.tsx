import {
  GAME_STATUS_ORDER,
  GameDetails,
  GameStatus,
  getGameStatus,
  SeriesDetails,
} from '../types';
import { getCoverHue } from '../coverHue';
import { MediaList } from '../MediaList';
import { MediaEditFormProps, StatusConfig } from '../MediaSpine';
import { AddMediaForm, EditMediaForm } from '../MediaForm';
import { useGameFormConfig } from './gameFormConfig';
import { Shelf } from '../Shelf';
import { useMediaStorage } from '../MediaStorageContext';
import { useMediaYears } from '../useMediaYears';
import { YearTabs } from '../../../shared/controls/YearTabs';

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
      listId={series && getSeriesItemsPath(series)}
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
  const formConfig = useGameFormConfig();
  const {
    years,
    selectedYear,
    selectYear,
    isThisYearSelected,
    seriesInYear,
    singlesInYear,
  } = useMediaYears(games);

  return (
    <div className="games">
      <h2>Games</h2>
      <YearTabs
        years={years}
        selectedYear={selectedYear}
        onSelectYear={selectYear}
      >
        <div className="shelves">
          {seriesInYear.map((series) => (
            <Shelf
              key={series.id}
              label={series.name}
              onRenameLabel={(name) => updateMediaSeries(series, name)}
            >
              <GameMediaList games={series.items} series={series} />
            </Shelf>
          ))}
          {singlesInYear.map((game) => (
            <Shelf key={game.id} single>
              <GameMediaList games={{ [game.id]: game }} />
            </Shelf>
          ))}
        </div>
      </YearTabs>
      {isThisYearSelected && (
        <AddMediaForm ariaLabel="Add a game" config={formConfig} />
      )}
    </div>
  );
}
