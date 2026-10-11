import { EditableText } from '../../../shared/controls/EditableText';
import { RestartArrowIcon } from '../../../shared/icons/RestartArrow';
import { TickIcon } from '../../../shared/icons/Tick';
import { useAdventureStorage } from './AdventureStorageContext';
import { ModePicker } from './ModePicker';
import { PlannedDateField } from './PlannedDateField';
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
        <div className="description">
          {mode && (
            <ModePicker
              mode={mode}
              onChange={(modeId) => updateAdventure({ ...adventure, modeId })}
            />
          )}
          <EditableText
            className="description-text"
            label="Description"
            style={{ fontSize: 'inherit' }}
            value={adventure.description}
            onChange={(description) =>
              updateAdventure({ ...adventure, description })
            }
            onDelete={() => deleteAdventure(adventure)}
          />
        </div>
        <div className="card-footer">
          <PlannedDateField
            date={adventure.plannedDate}
            isDone={adventure.isDone}
            onChange={(plannedDate) =>
              updateAdventure({ ...adventure, plannedDate })
            }
          />
          <div className="card-actions">
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
