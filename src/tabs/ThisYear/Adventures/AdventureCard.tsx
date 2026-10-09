import { DeleteWithConfirmation } from '../../../shared/controls/DeleteWithConfirmation';
import { RestartArrowIcon } from '../../../shared/icons/RestartArrow';
import { TickIcon } from '../../../shared/icons/Tick';
import { useAdventureStorage } from './AdventureStorageContext';
import { PlannedDate } from './PlannedDate';
import { Adventure, AdventureMode } from './types';

import './AdventureCard.css';

type AdventureCardProps = {
  adventure: Adventure;
  mode?: AdventureMode;
};

export function AdventureCard({ adventure, mode }: AdventureCardProps) {
  const { updateAdventure, deleteAdventure } = useAdventureStorage();

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
        <div className="card-footer">
          {adventure.plannedDate && (
            <PlannedDate
              date={adventure.plannedDate}
              isDone={adventure.isDone}
            />
          )}
          <div className="card-actions">
            <DeleteWithConfirmation
              onDelete={() => deleteAdventure(adventure)}
              className="ghost"
            />
            <button
              type="button"
              className="ghost"
              aria-label={adventure.isDone ? 'Mark not done' : 'Mark done'}
              onClick={() =>
                updateAdventure({ ...adventure, isDone: !adventure.isDone })
              }
            >
              {adventure.isDone ? <RestartArrowIcon /> : <TickIcon />}
            </button>
          </div>
        </div>
        {adventure.isDone && (
          <div className="done-stamp" role="img" aria-label="Done">
            <TickIcon />
          </div>
        )}
      </div>
    </li>
  );
}
