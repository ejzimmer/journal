import { AddAdventureForm } from './AddAdventureForm';

import './Noticeboard.css';

export function Noticeboard() {
  return (
    <section className="noticeboard" aria-label="Adventures">
      <div className="add-adventure">
        <AddAdventureForm />
      </div>
    </section>
  );
}
