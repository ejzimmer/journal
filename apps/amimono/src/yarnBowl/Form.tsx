import { useState } from 'react';
import { useYarnStorage } from './YarnStorageContext';
import { Operation, YARN_TYPE_IDS, YarnTypeId } from './types';
import { YARN_COLOURS } from './utils';
import { Switch } from 'shared/controls/Switch';
import { FormModal } from 'shared/controls/FormModal';
import { Combobox } from 'shared/controls/combobox/Combobox';
import { PlusMinusIcon } from 'shared/icons/PlusMinus';
import { TickIcon } from 'shared/icons/Tick';
import { XIcon } from 'shared/icons/X';

import { YARN_TYPE_OPTIONS, YarnTypeLabel } from './YarnTypeLabel';

import './Form.css';

export function YarnTrackingForm() {
  const { addYarn, removeYarn } = useYarnStorage();
  const [operation, setOperation] = useState<Operation>('-');
  const [yarnType, setYarnType] = useState<YarnTypeId>(YARN_TYPE_IDS[0]);

  const updateYarn = (event: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const amount = Number.parseFloat(String(data.get('amount')));

    if (!amount) {
      return false;
    }

    if (operation === '+') {
      addYarn(yarnType, amount);
    } else {
      removeYarn(yarnType, amount);
    }
    return true;
  };

  return (
    <div className="yarn-tracking-form">
      <FormModal
        trigger={(props) => (
          <button
            {...props}
            className="outline yarn-tracking-trigger"
            aria-label="Update yarn"
          >
            <PlusMinusIcon width="20px" />
            <span aria-hidden="true">🧶</span>
          </button>
        )}
        onSubmit={updateYarn}
        submitButtonClassName="yarn-tracking-submit"
        submitButtonContent={
          <TickIcon
            width="18px"
            strokeWidth="3"
            role="img"
            aria-label="Submit"
          />
        }
        cancelButtonContent={
          <XIcon width="14px" role="img" aria-label="Close" />
        }
      >
        <div
          className="yarn-tracking-fields"
          style={
            {
              '--yarn-colour': YARN_COLOURS[yarnType],
            } as React.CSSProperties
          }
        >
          <div className="yarn-type-picker">
            <Combobox
              ariaLabel="Yarn type"
              value={YARN_TYPE_OPTIONS.find((option) => option.id === yarnType)}
              options={YARN_TYPE_OPTIONS}
              onChange={(option) => setYarnType(option.id)}
              Option={YarnTypeLabel}
              Value={YarnTypeLabel}
            />
          </div>
          <Switch
            options={['-', '+']}
            value={operation}
            onChange={setOperation}
            name="yarn-tracking"
          />
          <input
            name="amount"
            aria-label="Grams"
            inputMode="numeric"
            pattern="[0-9, ]+"
            size={5}
          />
        </div>
      </FormModal>
    </div>
  );
}
