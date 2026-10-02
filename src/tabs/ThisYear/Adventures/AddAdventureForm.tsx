import { useState } from 'react';
import { FormControl } from '../../../shared/controls/FormControl';
import { Modal, useModal } from '../../../shared/controls/Modal';
import { TickIcon } from '../../../shared/icons/Tick';
import { useAdventureStorage } from './AdventureStorageContext';
import { ModeField, useModeField } from './ModeField';
import { PushpinButton } from './PushpinButton';

import './AddAdventureForm.css';

export function AddAdventureForm() {
  const [formKey, setFormKey] = useState(0);

  return (
    <Modal trigger={PushpinButton} onClose={() => setFormKey((key) => key + 1)}>
      <AdventureFields key={formKey} />
    </Modal>
  );
}

function AdventureFields() {
  const { addAdventure } = useAdventureStorage();
  const { closeModal } = useModal();
  const [description, setDescription] = useState('');
  const { modeFieldProps, saveMode } = useModeField();

  const saveAdventure = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim()) {
      return;
    }

    const modeId = saveMode();
    if (!modeId) {
      return;
    }

    addAdventure({ description: description.trim(), modeId });
    closeModal();
  };

  return (
    <form className="add-adventure-form" onSubmit={saveAdventure}>
      <FormControl
        label="Adventure"
        hideLabel
        value={description}
        onChange={setDescription}
      />
      <ModeField {...modeFieldProps} />
      <div className="footer">
        <button type="submit" className="ghost submit" aria-label="Add">
          <TickIcon width="20px" />
        </button>
      </div>
    </form>
  );
}
