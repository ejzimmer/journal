import {
  ListEntry,
  ListKey,
  Project,
  ProjectType,
  Subtask,
} from '../projects/types';

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

export const seedData: Record<string, unknown> = { projects, lists };
