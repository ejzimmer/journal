import { AddAdventureForm } from './AddAdventureForm';
import { useAdventureStorage } from './AdventureStorageContext';

import './Noticeboard.css';

export function Noticeboard() {
  const { adventures } = useAdventureStorage();

  return (
    <section className="noticeboard" aria-label="Adventures">
      <ul className="adventures">
        {adventures.map((adventure) => (
          <li key={adventure.id}>{adventure.description}</li>
        ))}
      </ul>
      <div className="add-adventure">
        <AddAdventureForm />
      </div>
    </section>
  );
}
