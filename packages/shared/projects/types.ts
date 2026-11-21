export type BaseSubtask = {
  id: string;
  description: string;
  status: 'ready' | 'done';
  position: number;
};

export type BaseProject = {
  id: string;
  description: string;
  category: string;
  subtasks?: Record<string, BaseSubtask>;
};
