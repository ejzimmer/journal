import { TickIcon } from '../../../shared/icons/Tick';
import { PlannedDate } from './PlannedDate';
import { Adventure, AdventureMode } from './types';

import './AdventureCard.css';

type AdventureCardProps = {
  adventure: Adventure;
  mode?: AdventureMode;
};

export function AdventureCard({ adventure, mode }: AdventureCardProps) {
  return (
    <li
      className={`adventure-card ${adventure.isDone ? 'done' : ''}`}
      style={{ '--mode-colour': mode?.colour } as React.CSSProperties}
    >
      <span className="pin" aria-hidden="true" />
      <div className="card-body">
        <p className="description">
          {mode && (
            <span className="mode-emoji" role="img" aria-label={mode.name}>
              {mode.emoji}
            </span>
          )}
          {adventure.description}
        </p>
        {adventure.plannedDate && (
          <PlannedDate date={adventure.plannedDate} isDone={adventure.isDone} />
        )}
        {adventure.isDone && (
          <div className="done-stamp" role="img" aria-label="Done">
            <TickIcon />
          </div>
        )}
      </div>
    </li>
  );
}
