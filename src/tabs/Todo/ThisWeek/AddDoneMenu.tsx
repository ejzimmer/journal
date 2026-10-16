import { SubmitEvent, useRef } from 'react';

import './AddDoneMenu.css';
import { Menu } from '../../../shared/controls/Menu';
import { getDateDaysAgo, getToday } from '../../../shared/dates';

const OLDEST_TRACKED_DAYS_AGO = 6;

type AddDoneMenuProps = {
  category: string;
  onAdd: (date: string) => void;
};

export function AddDoneMenu({ category, onAdd }: AddDoneMenuProps) {
  const dateRef = useRef<HTMLInputElement>(null);

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

        const submitDate = (event: SubmitEvent) => {
          event.preventDefault();
          const date = dateRef.current?.value;
          if (date) {
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
            <form className="add-done-on-date" onSubmit={submitDate}>
              <input
                ref={dateRef}
                type="date"
                aria-label="Date"
                defaultValue={getToday()}
                min={getDateDaysAgo(OLDEST_TRACKED_DAYS_AGO)}
                max={getToday()}
              />
              <button>Add</button>
            </form>
          </>
        );
      }}
    </Menu>
  );
}
