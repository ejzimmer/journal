export const ADVENTURES_PATH = '2026/adventures';
export const ADVENTURE_MODES_PATH = 'adventure_modes';

export type Adventure = {
  id: string;
  description: string;
  modeId: string;
  isDone: boolean;
  plannedDate?: string;
  completedAt?: string;
  position?: number;
};

export type AdventureMode = {
  id: string;
  name: string;
  emoji: string;
  colour: string;
  position?: number;
};
