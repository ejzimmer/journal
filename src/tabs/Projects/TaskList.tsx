import { Task } from "./Task";
import { TaskMetadata } from "./types";

type Props = {
  tasks?: TaskMetadata[];
};

export function TaskList({ tasks }: Props) {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <ul>
      {tasks?.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </ul>
  );
}
