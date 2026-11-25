import {
  ProjectPosition,
  ListKey,
  Project,
  ProjectType,
  Subtask,
  PROJECT_CATEGORY,
} from '../projects/types';
import { writeJumperPattern } from '../jumpers/jumperPattern';
import { JumperInputs, JumperPattern } from '../jumpers/types';
import { Recipient } from '../sockPlanner/types';
import { StoredYarn } from '../yarnBowl/types';

function createSubtasks(doneCount: number, totalCount: number) {
  return Object.fromEntries(
    Array.from({ length: totalCount }, (_, index): [string, Subtask] => {
      const id = `subtask-${index + 1}`;
      return [
        id,
        {
          id,
          description: `Subtask ${index + 1}`,
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
  portable: [
    ['Blanket', 'blanket', createSubtasks(3, 8)],
    ['Hat band', 'accessory'],
    ['Laptop sleeve', 'accessory'],
  ],
  priority: [
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
    ['Tiger socks', 'socks'],
    ['Linen skirt', 'dress'],
  ],
  done: [
    ['Rainbow mittens', 'accessory', createSubtasks(4, 4)],
    ['Baby bonnet', 'hat', createSubtasks(3, 3)],
  ],
};

const projects: Record<string, Project> = {};
const lists: Record<string, Record<string, ProjectPosition>> = {};

Object.entries(projectsByList).forEach(([listKey, entries]) => {
  lists[listKey] = {};
  entries.forEach(([description, type, subtasks], index) => {
    const id = `${listKey}-${index + 1}`;
    projects[id] = {
      id,
      description,
      category: PROJECT_CATEGORY,
      type,
      ...(subtasks && { subtasks }),
    };
    lists[listKey][id] = { id, position: index + 1 };
  });
});

projects['future-1'] = {
  ...projects['future-1'],
  socks: { direction: 'cuff_down', knittedSections: { first: 6, second: 2 } },
  recipientId: 'recipient-3',
};

projects['priority-1'] = {
  ...projects['priority-1'],
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

const recipientDetails: Array<[string, number, Recipient['overrides']?]> = [
  ['Me', 39],
  ['Mum', 37],
  ['Dad', 44],
  ['Alex', 38, { castOnStitches: 56 }],
  ['Sam', 37, { lengthMm: 230 }],
  ['Jo', 46],
];

const socks = Object.fromEntries(
  recipientDetails.map(
    ([name, euSize, overrides], index): [string, Recipient] => {
      const id = `recipient-${index + 1}`;
      return [id, { id, name, euSize, ...(overrides && { overrides }) }];
    },
  ),
);

const exampleJumperInputs: JumperInputs = {
  neckWidth: 21,
  crossChest: 43,
  armholeDepth: 23,
  hemToArmhole: 41,
  waistToHip: 28,
  bust: { cm: 101.5, source: 'body', easeCm: 5 },
  waist: { cm: 86, source: 'body', easeCm: 12.5 },
  hips: { cm: 105, source: 'body', easeCm: 10 },
  biceps: { cm: 29, source: 'body', easeCm: 5 },
  wrist: { cm: 16, source: 'body', easeCm: 7.5 },
  wristToUnderarm: 50,
  gauge: { stitches: 22, rows: 29, needleMm: 4.5, yarn: 'grey' },
  sleeveGauge: { stitches: 24, rows: 31, needleMm: 4 },
  capTopPercent: 30,
};

const jumpers: Record<string, JumperPattern> = {
  'hooded-cardigan': {
    id: 'hooded-cardigan',
    name: 'Hooded cardigan',
    inputs: exampleJumperInputs,
    pieces: writeJumperPattern(exampleJumperInputs),
  },
};

export const seedData: Record<string, unknown> = {
  projects,
  socks,
  jumpers,
  lists,
  yarn: { '2026': yarn },
};
