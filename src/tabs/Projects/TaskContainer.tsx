import { useTask } from "../../shared/TaskContext";
import { Task } from "./Task";

type Props = {
  id: string;
};

export function TaskContainer({ id }: Props) {
  const task = useTask(id);

  return task ? <Task task={task} /> : null;
}
