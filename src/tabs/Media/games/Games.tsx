import { useState } from 'react';
import { isSeries } from '../types';
import { AddMediaForm } from '../AddMediaForm';
import { useGameFormConfig } from './gameFormConfig';
import { GameMediaList } from './GameMediaList';
import { Shelf } from '../Shelf';
import { useMediaStorage } from '../MediaStorageContext';
import { useMediaYears } from '../useMediaYears';
import { Tab, Tabs } from '../../../shared/controls/Tabs';
import { useWindWakerGoals } from '../windWaker/useWindWakerGoals';
import { WindWakerGoals } from '../windWaker/WindWakerGoals';

const WIND_WAKER_TAB = 'wind-waker';

type GamesTab = number | typeof WIND_WAKER_TAB;

const WIND_WAKER: Tab<GamesTab> = {
  id: WIND_WAKER_TAB,
  label: 'Wind Waker',
  className: 'game-tab',
};

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
