import { AddAdventureForm } from './AddAdventureForm';
import { AdventureCard } from './AdventureCard';
import { useAdventureStorage } from './AdventureStorageContext';

import './Noticeboard.css';

export function Noticeboard() {
  const { adventures, modes } = useAdventureStorage();

  return (
    <section className="noticeboard" aria-label="Adventures">
      <ul className="adventures">
        {adventures.map((adventure) => (
          <AdventureCard
            key={adventure.id}
            adventure={adventure}
            mode={modes.find(({ id }) => id === adventure.modeId)}
          />
        ))}
      </ul>
      <div className="add-adventure">
        <AddAdventureForm />
      </div>
    </section>
  );
}
