import { useState } from 'react';
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
import { useMediaYears } from '../useMediaYears';
import { Tab, Tabs } from '../../../shared/controls/Tabs';
import { useWindWakerGoals } from '../windWaker/useWindWakerGoals';
import { WindWakerGoals } from '../windWaker/WindWakerGoals';

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

const WIND_WAKER_TAB = 'wind-waker';

type GamesTab = number | typeof WIND_WAKER_TAB;

const WIND_WAKER: Tab<GamesTab> = {
  id: WIND_WAKER_TAB,
  label: 'Wind Waker',
  className: 'game-tab',
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
      bandHue={series && getCoverHue(series.id)}
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
  const { years, selectedYear, selectYear, isThisYearSelected, entriesInYear } =
    useMediaYears(games);
  const { goals: windWakerGoals, updateGoal } = useWindWakerGoals();
  const [isWindWakerSelected, setIsWindWakerSelected] = useState(false);
  const isShowingWindWaker = isWindWakerSelected && !!windWakerGoals;

  const tabs: Tab<GamesTab>[] = [
    ...years.map((year) => ({ id: year, label: year })),
    ...(windWakerGoals ? [WIND_WAKER] : []),
  ];

  const selectTab = (tab: GamesTab) => {
    setIsWindWakerSelected(tab === WIND_WAKER_TAB);
    if (tab !== WIND_WAKER_TAB) selectYear(tab);
  };

  return (
    <div className="games">
      <h2>Games</h2>
      <Tabs
        tabs={tabs}
        selectedTab={isShowingWindWaker ? WIND_WAKER_TAB : selectedYear}
        onSelectTab={selectTab}
        label="Games"
      >
        {isShowingWindWaker ? (
          <WindWakerGoals goals={windWakerGoals} updateGoal={updateGoal} />
        ) : (
          <div className="shelves">
            {entriesInYear.map((entry) =>
              isSeries(entry) ? (
                <Shelf
                  key={entry.id}
                  label={entry.name}
                  onRenameLabel={(name) => updateMediaSeries(entry, name)}
                >
                  <GameMediaList games={entry.items} series={entry} />
                </Shelf>
              ) : (
                <Shelf key={entry.id} single>
                  <GameMediaList games={{ [entry.id]: entry }} />
                </Shelf>
              ),
            )}
          </div>
        )}
      </Tabs>
      {isThisYearSelected && !isShowingWindWaker && (
        <AddMediaForm ariaLabel="Add a game" config={formConfig} />
      )}
    </div>
  );
}
