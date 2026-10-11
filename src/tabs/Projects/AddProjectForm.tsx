import { useState } from 'react';
import { FormControl } from '../../shared/controls/FormControl';
import { useStorageContext } from '../../shared/FirebaseContext';
import { TickIcon } from '../../shared/icons/Tick';
import {
  categories,
  Category,
  ProjectDetails,
  PROJECTS_KEY,
  ProjectSubtask,
  SOCK_CATEGORY,
} from '../../shared/types';
import { CATEGORIES } from '../../shared/utils';
import { getNextPosition } from '../../shared/drag-and-drop/utils';
import { getSubtasksKey } from './utils';
import { NEW_SOCK_PROGRESS } from './socks/sockProgress';

type CategoryOption = Category | typeof SOCK_CATEGORY;

const allCategories = Array.from(
  new Set([...categories, ...CATEGORIES]),
).flatMap((category) =>
  category === '🧶' ? [category, SOCK_CATEGORY] : [category],
);

export function AddProjectForm() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CategoryOption>('🧹');

  const { useValue, addItem } = useStorageContext();
  const { value } = useValue<Record<string, ProjectDetails>>(PROJECTS_KEY);

  const addSockProject = (position: number) => {
    const projectId = addItem<ProjectDetails>(PROJECTS_KEY, {
      description,
      category: '🧶',
      parentId: PROJECTS_KEY,
      position,
      socks: NEW_SOCK_PROGRESS,
    });
    if (!projectId) return;

    addItem<ProjectSubtask>(getSubtasksKey(projectId), {
      description: 'Finishing',
      status: 'ready',
      category: '🧶',
      position: 0,
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!description || !category) {
      return;
    }

    const position = getNextPosition(value ? Object.values(value) : []);

    if (category === SOCK_CATEGORY) {
      addSockProject(position);
    } else {
      addItem<ProjectDetails>(PROJECTS_KEY, {
        description,
        category,
        parentId: PROJECTS_KEY,
        position,
      });
    }

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
          onChange={(event) =>
            setCategory(event.target.value as CategoryOption)
          }
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
