import { useContext, useMemo, useRef, useState } from 'react';
import { TickIcon } from 'shared/icons/Tick';
import { RestartArrowIcon } from 'shared/icons/RestartArrow';
import { useStorageContext } from 'shared/FirebaseContext';
import { Combobox } from 'shared/controls/combobox/Combobox';
import { OptionType } from 'shared/controls/combobox/types';
import { Switch } from 'shared/controls/Switch';
import { getNextPosition } from 'shared/drag-and-drop/utils';
import { getToday } from 'shared/dates';
import { CATEGORIES } from 'shared/utils';
import { TodoTask } from '../../../types';
import { CategoriesContext } from '../../Todo/TodoCategoriesProvider';
import {
  createTypeDetails,
  LIST_IDS,
  TODO_TYPES,
  TodoType,
  TypeFieldValues,
} from '../../Todo/todoTypes';
import { LatchButton } from './LatchButton';

import './AddTodoForm.css';

const INITIAL_TYPE_FIELDS: TypeFieldValues = {
  frequency: '1',
  dueDate: getToday(),
  repeats: false,
};

export function AddTodoForm() {
  const { useValue, addItem } = useStorageContext();
  const [type, setType] = useState<TodoType>('一度');
  const listId = LIST_IDS[type];
  const { value: list } = useValue<Record<string, TodoTask>>(listId);

  const categories = useContext(CategoriesContext);
  if (!categories) {
    throw new Error('Missing categories context provider');
  }
  const categoryOptions = useMemo(
    () =>
      Array.from(new Set([...CATEGORIES, ...categories])).map((category) => ({
        id: category,
        label: category,
      })),
    [categories],
  );

  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<OptionType>(categoryOptions[0]);
  const [typeFields, setTypeFields] = useState(INITIAL_TYPE_FIELDS);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const changeTypeFields = (change: Partial<TypeFieldValues>) =>
    setTypeFields((fields) => ({ ...fields, ...change }));

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const typeDetails = createTypeDetails(type, typeFields);
    if (!description || !category || !typeDetails) {
      return;
    }

    addItem(listId, {
      description,
      category: category.label,
      position: getNextPosition(Object.values(list ?? {})),
      ...typeDetails,
    });

    setDescription('');
    setTypeFields(INITIAL_TYPE_FIELDS);
    descriptionRef.current?.focus();
  };

  return (
    <ol className="task-pills add-todo">
      <li className="task-pill">
        <form
          className="today-task-description add-todo-form"
          onSubmit={handleSubmit}
        >
          <Switch
            options={[...TODO_TYPES]}
            value={type}
            onChange={setType}
            name="todo-type"
            className="todo-type-switch"
          />
          <Combobox
            ariaLabel="Category"
            value={category}
            options={categoryOptions}
            createOption={(value) => ({ id: value, label: value })}
            onChange={setCategory}
            inputSize={1}
          />
          <input
            className="add-todo-input add-todo-description"
            ref={descriptionRef}
            aria-label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {type === '毎週' && (
            <input
              className="add-todo-input add-todo-frequency"
              type="number"
              min={1}
              aria-label="Frequency"
              value={typeFields.frequency}
              onChange={(event) =>
                changeTypeFields({ frequency: event.target.value })
              }
            />
          )}
          {type === '期日' && (
            <>
              <input
                className="add-todo-input add-todo-due-date"
                type="date"
                aria-label="Due date"
                value={typeFields.dueDate}
                onChange={(event) =>
                  changeTypeFields({ dueDate: event.target.value })
                }
              />
              <LatchButton
                label="Repeats"
                isPressed={typeFields.repeats}
                onClick={() =>
                  changeTypeFields({ repeats: !typeFields.repeats })
                }
              >
                <RestartArrowIcon width="16px" />
              </LatchButton>
            </>
          )}
          <button type="submit" className="add-todo-submit" aria-label="Create">
            <TickIcon width="18px" />
          </button>
        </form>
      </li>
    </ol>
  );
}
