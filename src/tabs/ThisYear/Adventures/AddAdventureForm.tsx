import { useState } from 'react';
import { Modal } from '../../../shared/controls/Modal';
import { AdventureFields } from './AdventureFields';
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
