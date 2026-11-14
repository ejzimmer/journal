import { SockProgress } from '../socks/types';

export type JournalSubtask = {
  id: string;
  description: string;
  status: 'ready' | 'done';
  position: number;
  linkedId?: string;
  category?: string;
};

export type JournalProject = {
  id: string;
  description: string;
  category: string;
  position: number;
  status?: 'ready' | 'in_progress' | 'done';
  subtasks?: Record<string, JournalSubtask>;
  socks?: SockProgress;
};
