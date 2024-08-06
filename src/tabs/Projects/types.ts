export type TaskMetadata = {
  id: string;
  description: string;
  isDone: boolean;
  tasks?: TaskMetadata[];
};
