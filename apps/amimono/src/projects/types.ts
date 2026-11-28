import { BaseProject, BaseSubtask } from 'shared/projects/types';
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

// Every Amimono project sits in the journal's yarn category.
export const PROJECT_CATEGORY = '🧶';

export type Subtask = BaseSubtask;

export type Colourway = {
  id: string;
  name: string;
  skeins: number;
  dyeLot?: string;
  photoUrl?: string;
  position: number;
};

export type Yarn = {
  id: string;
  name: string;
  ravelryId?: number;
  colourways?: Record<string, Colourway>;
  position: number;
};

export type Gauge = {
  stitches?: number;
  rows?: number;
  needleMm?: number;
};

export type Project = BaseProject & {
  category: typeof PROJECT_CATEGORY;
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
