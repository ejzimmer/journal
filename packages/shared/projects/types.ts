// The journal's Today slots show subtasks from both the journal and Amimono,
// so both apps' projects and subtasks share these fields.
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
