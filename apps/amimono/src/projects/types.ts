import { SockProgress } from '../socks/types';

export const PROJECTS_KEY = 'projects';
export const LISTS_KEY = 'lists';

export const LIST_KEYS = ['priority', 'portable', 'future', 'done'] as const;
export type ListKey = (typeof LIST_KEYS)[number];

export const PROJECT_TYPE_KEYS = [
  'socks',
  'jumper',
  'vest',
  'dress',
  'cardigan',
  'amigurumi',
  'hat',
  'blanket',
  'shawl',
  'accessory',
] as const;
export type ProjectType = (typeof PROJECT_TYPE_KEYS)[number];

export type Craft = 'knitting' | 'crochet' | 'weaving';

// The journal's Today tab shows a subtask's category as its emoji.
export const SUBTASK_CATEGORY = '🧶';

export type Subtask = {
  id: string;
  description: string;
  status: 'ready' | 'done';
  category: typeof SUBTASK_CATEGORY;
  position: number;
};

export type Colourway = {
  id: string;
  name: string;
  skeins: number;
  dyeLot?: string;
  position: number;
};

export type Yarn = {
  id: string;
  name: string;
  colourways?: Record<string, Colourway>;
  position: number;
};

export type Gauge = {
  stitches?: number;
  rows?: number;
  needleMm?: number;
};

export type Project = {
  id: string;
  name: string;
  type: ProjectType;
  craft?: Craft;
  pattern?: { name?: string; url?: string };
  yarns?: Record<string, Yarn>;
  gauge?: Gauge;
  subtasks?: Record<string, Subtask>;
  socks?: SockProgress;
  recipientId?: string;
};

export type ListPosition = {
  list: ListKey;
  position: number;
};

export type ProjectPosition = {
  id: string;
  position: number;
  previous?: ListPosition;
};

export type ProjectLists = Record<ListKey, Project[]>;

export type StoredLists = Partial<
  Record<ListKey, Record<string, ProjectPosition>>
>;
