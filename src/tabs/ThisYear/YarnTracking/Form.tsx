import { useState } from 'react';
import { useYarnStorage } from './YarnStorageContext';
import { getThisYear } from '../../../shared/dates';
import { isYarnTypeId, Operation, YARN_TYPE_IDS, YarnTypeId } from './types';
import { YARN_COLOURS } from './utils';
import { Switch } from '../../../shared/controls/Switch';
import { FormModal } from '../../../shared/controls/FormModal';
import { BallOfYarnIcon } from '../../../shared/icons/BallOfYarn';
import { PlusMinusIcon } from '../../../shared/icons/PlusMinus';
import { TickIcon } from '../../../shared/icons/Tick';
import { XIcon } from '../../../shared/icons/X';

import './Form.css';

const YARN_COLOUR_PROPERTIES = Object.fromEntries(
  YARN_TYPE_IDS.map((id) => [
    `--${id.replace(' ', '-')}-colour`,
    YARN_COLOURS[id],
  ]),
) as React.CSSProperties;

export function YarnTrackingForm() {
  const { addYarn, removeYarn } = useYarnStorage(getThisYear());
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
    <div className="yarn-tracking-form" style={YARN_COLOUR_PROPERTIES}>
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
          <TickIcon width="18px" role="img" aria-label="Submit" />
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
          <select
            name="yarnType"
            aria-label="Yarn type"
            value={yarnType}
            onChange={(event) => {
              if (isYarnTypeId(event.target.value)) {
                setYarnType(event.target.value);
              }
            }}
          >
            <button type="button">
              <BallOfYarnIcon width="20px" colour={YARN_COLOURS[yarnType]} />
              {yarnType}
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
    </div>
  );
}
