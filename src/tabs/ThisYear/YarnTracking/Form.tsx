import { useState } from 'react';
import { useYarnStorage } from './YarnStorageContext';
import { isYarnTypeId, Operation, YARN_TYPE_IDS } from './types';
import { YARN_COLOURS } from './utils';
import { Switch } from '../../../shared/controls/Switch';
import { FormModal } from '../../../shared/controls/FormModal';
import { BallOfYarnIcon } from '../../../shared/icons/BallOfYarn';
import { PlusMinusIcon } from '../../../shared/icons/PlusMinus';

import './Form.css';

export function YarnTrackingForm() {
  const { addYarn, removeYarn } = useYarnStorage();
  const [operation, setOperation] = useState<Operation>('-');

  const updateYarn = (event: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget);
    const yarnType = data.get('yarnType');
    const amount = Number.parseFloat(String(data.get('amount')));

    if (typeof yarnType !== 'string' || !isYarnTypeId(yarnType) || !amount) {
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
      submitButtonText="Submit"
    >
      <div className="yarn-tracking-form">
        <select name="yarnType" aria-label="Yarn type">
          <button type="button">
            <selectedcontent />
          </button>
          {YARN_TYPE_IDS.map((id) => (
            <option key={id} value={id}>
              <BallOfYarnIcon width="20px" colour={YARN_COLOURS[id]} />
              {id}
            </option>
          ))}
        </select>
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
  );
}
