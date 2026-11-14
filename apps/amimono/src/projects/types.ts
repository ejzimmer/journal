export const PROJECTS_KEY = 'projects';
export const LISTS_KEY = 'lists';

export const LIST_KEYS = ['meetings', 'concentration', 'future'] as const;
export type ListKey = (typeof LIST_KEYS)[number];

export const PROJECT_TYPE_KEYS = [
  'socks',
  'jumper',
  'vest',
  'cardigan',
  'amigurumi',
  'hat',
  'blanket',
  'shawl',
  'accessory',
] as const;
export type ProjectType = (typeof PROJECT_TYPE_KEYS)[number];

export type Craft = 'knitting' | 'crochet' | 'weaving';

export type Subtask = {
  id: string;
  description: string;
  status: 'ready' | 'done';
  position: number;
};

export type Colourway = {
  id: string;
  name: string;
  skeins: number;
  dyeLot?: string;
};

export type Yarn = {
  id: string;
  name: string;
  colourways?: Record<string, Colourway>;
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
};

export type ListEntry = {
  id: string;
  position: number;
};

export type ProjectLists = Record<ListKey, Project[]>;

export type StoredLists = Partial<Record<ListKey, Record<string, ListEntry>>>;
