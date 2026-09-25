import { useRef, useState } from 'react';
import { useYarnStorage } from './YarnStorageContext';
import { Operation } from './types';
import { Switch } from '../../../shared/controls/Switch';

import './Form.css';
import { TickIcon } from '../../../shared/icons/Tick';

export function YarnTrackingForm() {
  const { yarnByType = [], addYarn, removeYarn } = useYarnStorage();

  const yarnTypeRef = useRef<HTMLSelectElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const [operation, setOperation] = useState<Operation>('-');

  const updateYarn = (event: React.FormEvent) => {
    event.preventDefault();

    const yarnType = yarnTypeRef.current?.value;
    const amount =
      amountRef.current?.value && Number.parseFloat(amountRef.current.value);

    if (!yarnType || !operation || !amount) {
      return;
    }

    if (operation === '+') {
      addYarn(yarnType, amount);
    } else {
      removeYarn(yarnType, amount);
    }
  };

  return (
    <form onSubmit={updateYarn} className="yarn-tracking-form">
      <select ref={yarnTypeRef}>
        {yarnByType.map(({ id }) => (
          <option key={id} value={id}>
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
      <input pattern="[0-9, ]+" size={5} ref={amountRef} />
      <button className="outline" type="submit">
        <TickIcon width="18px" colour="var(--success-colour)" />
      </button>
    </form>
  );
}
