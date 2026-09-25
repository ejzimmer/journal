import { useRef, useState } from 'react';
import { useStorageContext } from '../../../shared/FirebaseContext';
import { KEY, YarnType } from './types';
import { useYarn } from './useYarn';
import { Switch } from '../../../shared/controls/Switch';

import './Form.css';
import { TickIcon } from '../../../shared/icons/Tick';
import { getLatestBalance, getThisMonth } from './utils';

export function YarnTrackingForm() {
  const { updateItem } = useStorageContext();
  const value = useYarn();
  const yarnTypes = Object.keys(value ?? {});

  const yarnTypeRef = useRef<HTMLSelectElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [operation, setOperation] = useState<'+' | '-'>('-');

  const updateYarn = (event: React.FormEvent) => {
    event.preventDefault();

    if (!value) {
      return;
    }

    const yarnType = yarnTypeRef.current?.value;
    const amount =
      amountRef.current?.value && Number.parseFloat(amountRef.current.value);

    if (!yarnType || !operation || !amount) {
      return;
    }

    const yarnDetails = value[yarnType];
    const currentBalance = getLatestBalance(yarnDetails);

    // eslint-disable-next-line no-eval
    const newBalance = eval(`${currentBalance}${operation}${amount}`);

    updateItem<YarnType>(`${KEY}`, {
      id: yarnType,
      history: {
        ...yarnDetails.history,
        [getThisMonth().toString()]: newBalance,
      },
    });
  };

  return (
    <form onSubmit={updateYarn} className="yarn-tracking-form">
      <select ref={yarnTypeRef}>
        {yarnTypes.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      <Switch
        options={['-', '+']}
        value={operation}
        onChange={setOperation}
        name="yarn-tracking"
      />
      <input pattern="[0-9, ]+" size={5} ref={amountRef} />
      <button className="outline" type="submit">
        <TickIcon width="18px" colour="var(--success-colour)" />
      </button>
    </form>
  );
}
