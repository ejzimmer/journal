import { useState } from 'react';
import { FormControl } from '../../shared/controls/FormControl';
import { useStorageContext } from '../../shared/FirebaseContext';
import { TickIcon } from '../../shared/icons/Tick';
import {
  categories,
  Category,
  ProjectDetails,
  PROJECTS_KEY,
} from '../../shared/types';
import { CATEGORIES } from '../../shared/utils';
import { getNextPosition } from '../../shared/drag-and-drop/utils';

const allCategories = Array.from(new Set([...categories, ...CATEGORIES]));

export function AddProjectForm() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('🧹');

  const { useValue, addItem } = useStorageContext();
  const { value } = useValue<Record<string, ProjectDetails>>(PROJECTS_KEY);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!description || !category) {
      return;
    }

    addItem<ProjectDetails>(PROJECTS_KEY, {
      description,
      category,
      parentId: PROJECTS_KEY,
      position: getNextPosition(value ? Object.values(value) : []),
    });

    setDescription('');
    setCategory('🧹');
  };

  return (
    <form
      style={{
        padding: '8px 16px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '12px',
      }}
      onSubmit={handleSubmit}
    >
      <FormControl
        label="Description"
        value={description}
        onChange={setDescription}
        hideLabel
        inputClass="subtle"
      />
      <div>
        <select
          aria-label="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value as Category)}
          className="subtle"
        >
          {allCategories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <button type="submit" className="ghost">
        <TickIcon width="24px" colour="var(--success-colour)" />
      </button>
    </form>
  );
}
