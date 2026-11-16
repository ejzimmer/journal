import { FormEvent, useId, useState } from 'react';

import './AddProjectForm.css';
import { PlusIcon } from 'shared/icons/Plus';
import { PROJECT_TYPES } from './projectTypes';
import { PROJECT_TYPE_KEYS, ProjectType } from './types';

type AddProjectFormProps = {
  onAdd: (name: string, type: ProjectType) => void;
};

export function AddProjectForm({ onAdd }: AddProjectFormProps) {
  const nameId = useId();
  const typeId = useId();
  const [name, setName] = useState('');
  const [type, setType] = useState<ProjectType>('socks');

  const addProject = (event: FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onAdd(trimmedName, type);
    setName('');
  };

  return (
    <form className="add-project-form" onSubmit={addProject}>
      <label htmlFor={nameId}>New project</label>
      <input
        id={nameId}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <label htmlFor={typeId} className="visually-hidden">
        Type
      </label>
      <select
        id={typeId}
        value={type}
        onChange={(event) => setType(event.target.value as ProjectType)}
      >
        {PROJECT_TYPE_KEYS.map((typeKey) => (
          <option key={typeKey} value={typeKey}>
            {PROJECT_TYPES[typeKey].label}
          </option>
        ))}
      </select>
      <button type="submit" aria-label="Add project" title="Add project">
        <PlusIcon width="16" />
      </button>
    </form>
  );
}
