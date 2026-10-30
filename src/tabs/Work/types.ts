export const COLOURS = [
  'blue',
  'yellow',
  'purple',
  'green',
  'orange',
  'red',
] as const;

export type Colour = (typeof COLOURS)[number];

export type Label = {
  value: string;
  colour: Colour;
};

export type StoredLabel = Label & {
  id: string;
  lastRemoved?: number;
};

export const LABELS_KEY = 'work-labels';

export type StatusKey = 'not_started' | 'done';

export const BLOCKERS = ['merge_queue', 'build', 'human', 'time'] as const;
export type Blocker = (typeof BLOCKERS)[number];

export type Blocked =
  { on: Exclude<Blocker, 'time'> } | { on: 'time'; until: string };

export type Subtask = {
  id: string;
  description: string;
  position: number;
};

export type WorkTask = {
  id: string;
  description: string;
  status: StatusKey;
  parentId: string;
  items?: Record<string, WorkTask>;
  lastStatusUpdate: string;
  dueDate?: string;
  position: number;
  labelIds?: string[];
  blocked?: Blocked;
  subtasks?: Record<string, Subtask>;
};

export const WORK_KEY = 'work';
export const WORK_CLEANUP_KEY = 'work-daily-cleanup';

const createStandardId = (description: string) =>
  `standard-${description.toLowerCase().replace(/\s+/g, '-')}`;

export const STANDARD_CHECKLIST = new Map(
  [
    'test',
    'review',
    'PR',
    'QA',
    'build',
    'mark PR ready',
    'approvals',
    'FG',
  ].map((description) => [createStandardId(description), description]),
);
