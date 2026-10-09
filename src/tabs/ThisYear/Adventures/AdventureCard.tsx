import { useEffect, useRef, useState } from 'react';
import { RestartArrowIcon } from '../../../shared/icons/RestartArrow';
import { RubbishBinIcon } from '../../../shared/icons/RubbishBin';
import { TickIcon } from '../../../shared/icons/Tick';
import { useAdventureStorage } from './AdventureStorageContext';
import { DeleteConfirmation } from './DeleteConfirmation';
import { PlannedDate } from './PlannedDate';
import { Adventure, AdventureMode } from './types';

import './AdventureCard.css';

type AdventureCardProps = {
  adventure: Adventure;
  mode?: AdventureMode;
};

export function AdventureCard({ adventure, mode }: AdventureCardProps) {
  const { updateAdventure, deleteAdventure } = useAdventureStorage();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const wasConfirmingDelete = useRef(false);
  const binButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (wasConfirmingDelete.current && !isConfirmingDelete) {
      binButton.current?.focus();
    }
    wasConfirmingDelete.current = isConfirmingDelete;
  }, [isConfirmingDelete]);

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
            {isConfirmingDelete ? (
              <DeleteConfirmation
                onConfirm={() => deleteAdventure(adventure)}
                onCancel={() => setIsConfirmingDelete(false)}
              />
            ) : (
              <>
                <button
                  ref={binButton}
                  type="button"
                  className="ghost delete"
                  aria-label="Delete"
                  onClick={() => setIsConfirmingDelete(true)}
                >
                  <RubbishBinIcon width="14px" />
                </button>
                <button
                  type="button"
                  className="ghost"
                  aria-label={adventure.isDone ? 'Mark not done' : 'Mark done'}
                  onClick={() =>
                    updateAdventure({ ...adventure, isDone: !adventure.isDone })
                  }
                >
                  {adventure.isDone ? (
                    <RestartArrowIcon width="16px" />
                  ) : (
                    <TickIcon width="16px" />
                  )}
                </button>
              </>
            )}
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
