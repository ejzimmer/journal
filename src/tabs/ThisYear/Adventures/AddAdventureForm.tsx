import { useState } from 'react';
import { FormControl } from '../../../shared/controls/FormControl';
import { Modal, useModal } from '../../../shared/controls/Modal';
import { TickIcon } from '../../../shared/icons/Tick';
import { useAdventureStorage } from './AdventureStorageContext';
import { ModeField } from './ModeField';
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
  const { modes, addAdventure } = useAdventureStorage();
  const { closeModal } = useModal();
  const [description, setDescription] = useState('');
  const [selectedModeId, setSelectedModeId] = useState<string>();
  const modeId = selectedModeId ?? modes[0]?.id;

  const saveAdventure = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!description.trim() || !modeId) {
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
      <ModeField modeId={modeId} onSelectMode={setSelectedModeId} />
      <div className="footer">
        <button type="submit" className="ghost submit" aria-label="Add">
          <TickIcon width="20px" />
        </button>
      </div>
    </form>
  );
}
