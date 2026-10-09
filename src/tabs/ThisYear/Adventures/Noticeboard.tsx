import { AddAdventureForm } from './AddAdventureForm';
import { AdventureCard } from './AdventureCard';
import { useAdventureStorage } from './AdventureStorageContext';
import { Adventure } from './types';
import { YearTabs } from '../../../shared/controls/YearTabs';
import { getCompletionYear, useItemYears } from '../../../shared/years';

import './Noticeboard.css';

const isAdventureDone = (adventure: Adventure) => adventure.isDone;

export function Noticeboard() {
  const { adventures, modes } = useAdventureStorage();
  const {
    years,
    selectedYear,
    selectYear,
    isThisYearSelected,
    isInSelectedYear,
  } = useItemYears(adventures, isAdventureDone, getCompletionYear);

  return (
    <section className="noticeboard" aria-label="Adventures">
      <YearTabs
        years={years}
        selectedYear={selectedYear}
        onSelectYear={selectYear}
      >
        <ul className="adventures">
          {adventures.filter(isInSelectedYear).map((adventure) => (
            <AdventureCard
              key={adventure.id}
              adventure={adventure}
              mode={modes.find(({ id }) => id === adventure.modeId)}
            />
          ))}
        </ul>
      </YearTabs>
      {isThisYearSelected && (
        <div className="add-adventure">
          <AddAdventureForm />
        </div>
      )}
    </section>
  );
}
