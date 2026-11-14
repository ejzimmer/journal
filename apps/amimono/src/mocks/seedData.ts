import {
  ListEntry,
  ListKey,
  Project,
  ProjectType,
  Subtask,
} from '../projects/types';
import { StoredYarn } from '../yarnBowl/types';

function createSubtasks(doneCount: number, totalCount: number) {
  return Object.fromEntries(
    Array.from({ length: totalCount }, (_, index): [string, Subtask] => {
      const id = `subtask-${index + 1}`;
      return [
        id,
        {
          id,
          description: `Step ${index + 1}`,
          status: index < doneCount ? 'done' : 'ready',
          position: index + 1,
        },
      ];
    }),
  );
}

const projectsByList: Record<
  ListKey,
  Array<[string, ProjectType, Project['subtasks']?]>
> = {
  meetings: [
    ['Blanket', 'blanket', createSubtasks(3, 8)],
    ['Hat band', 'accessory'],
    ['Laptop sleeve', 'accessory'],
  ],
  concentration: [
    ['Cardigan', 'cardigan', createSubtasks(2, 5)],
    ['Jacket', 'cardigan'],
    ['Bolero', 'cardigan'],
  ],
  future: [
    ['Self-striping socks for Dad', 'socks'],
    ['Unabridged', 'vest'],
    ['Brioche shawl', 'shawl'],
    ['Fair Isle tam', 'hat'],
    ['Unicorn', 'amigurumi'],
    ['Cabled jumper', 'jumper'],
  ],
};

const projects: Record<string, Project> = {};
const lists: Record<string, Record<string, ListEntry>> = {};

Object.entries(projectsByList).forEach(([listKey, entries]) => {
  lists[listKey] = {};
  entries.forEach(([name, type, subtasks], index) => {
    const id = `${listKey}-${index + 1}`;
    projects[id] = { id, name, type, ...(subtasks && { subtasks }) };
    lists[listKey][id] = { id, position: index + 1 };
  });
});

projects['future-1'] = {
  ...projects['future-1'],
  socks: { direction: 'cuff_down', knittedSections: { first: 6, second: 2 } },
};

projects['concentration-1'] = {
  ...projects['concentration-1'],
  craft: 'knitting',
  pattern: {
    name: 'Telja Cardigan',
    url: 'https://www.ravelry.com/patterns/library/telja-cardigan',
  },
  yarns: {
    tweed: {
      id: 'tweed',
      name: 'Rowan Felted Tweed',
      colourways: {
        ancient: {
          id: 'ancient',
          name: 'Ancient',
          skeins: 6,
          dyeLot: '2481',
          position: 1,
        },
        mineral: {
          id: 'mineral',
          name: 'Mineral',
          skeins: 1.5,
          dyeLot: '0917',
          position: 2,
        },
      },
      position: 1,
    },
    kidSilk: {
      id: 'kidSilk',
      name: 'Drops Kid-Silk',
      colourways: {
        beige: {
          id: 'beige',
          name: 'Light beige',
          skeins: 3,
          dyeLot: '66310',
          position: 1,
        },
      },
      position: 2,
    },
  },
  gauge: { stitches: 22, rows: 30, needleMm: 4 },
};

const yarn: StoredYarn = {
  wool: {
    id: 'wool',
    history: {
      '2026-01': 4732,
      '2026-03': 4380,
      '2026-06': 3910,
      '2026-09': 3520,
    },
  },
  cotton: {
    id: 'cotton',
    history: { '2026-01': 420, '2026-04': 365, '2026-07': 300 },
  },
  acrylic: {
    id: 'acrylic',
    history: { '2026-01': 246, '2026-06': 180, '2026-09': 95 },
  },
  'sock yarn': {
    id: 'sock yarn',
    history: {
      '2026-01': 2641,
      '2026-02': 2480,
      '2026-05': 2150,
      '2026-08': 1890,
    },
  },
};

export const seedData: Record<string, unknown> = {
  projects,
  lists,
  yarn: { '2026': yarn },
};
