import { useStorageContext } from 'shared/FirebaseContext';
import { DailyTask } from '../../../types';
import { TodayTaskEditor } from './TodayTaskEditor';

type DailyTaskEditorProps = {
  task: DailyTask;
  listId: string;
  onChange: (task: DailyTask) => void;
  onClose: () => void;
};

export function DailyTaskEditor({
  task,
  listId,
  onChange,
  onClose,
}: DailyTaskEditorProps) {
  const { deleteItem } = useStorageContext();

  return (
    <TodayTaskEditor
      category={task.category}
      description={task.description}
      onChangeCategory={(category) => onChange({ ...task, category })}
      onChangeDescription={(description) => {
        if (description === '') {
          deleteItem<DailyTask>(listId, task);
        } else {
          onChange({ ...task, description });
        }
      }}
      onClose={onClose}
    />
  );
}
