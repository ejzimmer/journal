import { FormEvent, useState } from 'react';

import './AddProjectForm.css';
import { PlusIcon } from 'shared/icons/Plus';
import { CraftPicker } from '../edit/CraftPicker';
import { TypePicker } from '../edit/TypePicker';
import { createCardStyle } from './createCardStyle';
import { NON_BLANK_PATTERN } from './nonBlankPattern';
import { Craft, ProjectType } from './types';

type AddProjectFormProps = {
  onAdd: (name: string, type: ProjectType, craft?: Craft) => void;
};

export function AddProjectForm({ onAdd }: AddProjectFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('socks');
  const [craft, setCraft] = useState<Craft>();

  const addProject = (event: FormEvent) => {
    event.preventDefault();
    onAdd(name.trim(), type, craft);
    setName('');
  };

  return (
    <form
      className="add-project-form"
      style={createCardStyle(type)}
      onSubmit={addProject}
    >
      <input
        aria-label="New project"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        pattern={NON_BLANK_PATTERN}
      />
      <CraftPicker craft={craft} onChange={setCraft} hideLabel />
      <TypePicker type={type} onChange={setType} hideLabel />
      <button type="submit" aria-label="Add project" title="Add project">
        <PlusIcon width="16" />
      </button>
    </form>
  );
}
