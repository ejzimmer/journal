import { useStorageContext } from 'shared/FirebaseContext';
import { PROJECTS_KEY, Subtask } from '../projects/types';

export function useSubtaskActions(projectId: string, subtasks: Subtask[]) {
  const { setValue } = useStorageContext();
  const subtasksPath = `${PROJECTS_KEY}/${projectId}/subtasks`;

  const markSubtaskDone = (subtask: Subtask, isDone: boolean) => {
    setValue(`${subtasksPath}/${subtask.id}/status`, isDone ? 'done' : 'ready');
  };

  const addSubtask = (description: string) => {
    const id = crypto.randomUUID();
    const position =
      Math.max(0, ...subtasks.map((subtask) => subtask.position)) + 1;
    setValue(`${subtasksPath}/${id}`, {
      id,
      description,
      status: 'ready',
      position,
    });
  };

  return { markSubtaskDone, addSubtask };
}
