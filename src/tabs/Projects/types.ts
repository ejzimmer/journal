export type Task = {
  id: string;
  description: string;
  isDone: boolean;
  tasks?: Task[];
};
