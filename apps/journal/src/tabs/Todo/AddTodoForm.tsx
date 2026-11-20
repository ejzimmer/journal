import { useContext, useMemo, useRef, useState } from 'react';
import './AddTodoForm.css';
import { TickIcon } from 'shared/icons/Tick';
import { useStorageContext } from 'shared/FirebaseContext';
import { FormControl } from 'shared/controls/FormControl';
import { Combobox } from 'shared/controls/combobox/Combobox';
import { OptionType } from 'shared/controls/combobox/types';
import { Switch } from 'shared/controls/Switch';
import { getNextPosition } from 'shared/drag-and-drop/utils';
import { getToday } from 'shared/dates';
import { CATEGORIES } from 'shared/utils';
import { CategoriesContext } from '.';
import { TodoTask } from '../../types';
import { DueDateFields } from './DueDateFields';
import {
  createTypeDetails,
  LIST_IDS,
  TODO_TYPES,
  TodoType,
  TypeFieldValues,
} from './todoTypes';

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
    <form className="add-todo-form" onSubmit={handleSubmit}>
      <Switch
        options={[...TODO_TYPES]}
        value={type}
        onChange={setType}
        name="todo-type"
        className="led-switch"
      />
      <div key={type} className="add-todo-fields">
        <Combobox
          label="Category"
          value={category}
          options={categoryOptions}
          createOption={(value) => ({ id: value, label: value })}
          onChange={setCategory}
          inputSize={1}
        />
        <div className="description">
          <FormControl
            label="Description"
            value={description}
            onChange={setDescription}
            ref={descriptionRef}
          />
        </div>
        {type === '毎週' && (
          <FormControl
            type="number"
            label="Frequency"
            value={typeFields.frequency}
            size={2}
            onChange={(frequency) => changeTypeFields({ frequency })}
          />
        )}
        {type === '期日' && (
          <DueDateFields
            dueDate={typeFields.dueDate}
            repeats={typeFields.repeats}
            onChangeDueDate={(dueDate) => changeTypeFields({ dueDate })}
            onChangeRepeats={(repeats) => changeTypeFields({ repeats })}
          />
        )}
      </div>
      <button type="submit" className="icon led-button led" aria-label="Create">
        <TickIcon width="20px" />
      </button>
    </form>
  );
}
