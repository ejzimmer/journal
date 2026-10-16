import { KeyboardEvent } from 'react';

import './AddDoneMenu.css';
import { Menu } from '../../../shared/controls/Menu';
import { getDateDaysAgo, getToday } from '../../../shared/dates';

const OLDEST_TRACKED_DAYS_AGO = 6;

type AddDoneMenuProps = {
  category: string;
  onAdd: (date: string) => void;
};

export function AddDoneMenu({ category, onAdd }: AddDoneMenuProps) {
  return (
    <Menu
      trigger={(props) => (
        <button {...props} className="icon subtle">
          {category}
        </button>
      )}
    >
      {({ onClose }) => {
        const addDoneOn = (date: string) => {
          onAdd(date);
          onClose();
        };

        const addDoneOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
          const date = event.currentTarget.value;
          if (event.key === 'Enter' && date) {
            event.preventDefault();
            addDoneOn(date);
          }
        };

        return (
          <>
            <Menu.Action onClick={() => addDoneOn(getToday())}>
              Add today
            </Menu.Action>
            <Menu.Action onClick={() => addDoneOn(getDateDaysAgo(1))}>
              Add yesterday
            </Menu.Action>
            <input
              className="add-done-on-date"
              type="date"
              aria-label="Date"
              defaultValue={getToday()}
              min={getDateDaysAgo(OLDEST_TRACKED_DAYS_AGO)}
              max={getToday()}
              onKeyDown={addDoneOnEnter}
            />
          </>
        );
      }}
    </Menu>
  );
}
