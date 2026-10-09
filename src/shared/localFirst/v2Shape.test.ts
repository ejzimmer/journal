import {
  convertPathToV2,
  convertReadValueToV1,
  convertTreeToV1,
  convertTreeToV2,
  convertUpdatesToV2,
  createV2Copy,
  findV2ReadPath,
  listDifferences,
  listVersionDifferences,
} from './v2Shape';

const v1Tree = {
  today: {
    週: {
      laundry: {
        id: 'laundry',
        description: 'Laundry',
        frequency: 2,
        completed: ['2026-10-05', '2026-10-05', '2026-10-07'],
      },
    },
  },
  health: {
    daily: {
      '2026-10-07': {
        id: '2026-10-07',
        consumed: 1800,
        trackers: ['🥚', '🟤'],
      },
    },
    classes: {
      pilates: {
        id: 'pilates',
        description: 'Pilates',
        blocks: [
          { id: 'week-1', total: 3, completed: [0, 2] },
          { id: 'week-2', total: 3 },
        ],
      },
    },
  },
  work: {
    list1: {
      id: 'list1',
      labelIds: ['urgent', 'backend'],
      items: { task1: { id: 'task1', labelIds: ['backend'] } },
    },
  },
  projects: { garden: { id: 'garden', description: 'Garden' } },
};

const v2Tree = {
  today: {
    週: {
      laundry: {
        id: 'laundry',
        description: 'Laundry',
        frequency: 2,
        completed: {
          t0000: '2026-10-05',
          t0001: '2026-10-05',
          t0002: '2026-10-07',
        },
      },
    },
  },
  health: {
    daily: {
      '2026-10-07': {
        id: '2026-10-07',
        consumed: 1800,
        period: { ovaryPain: true, lightFlow: true },
      },
    },
    classes: {
      pilates: {
        id: 'pilates',
        description: 'Pilates',
        blocks: {
          'week-1': {
            id: 'week-1',
            total: 3,
            position: 0,
            completed: { s0: true, s2: true },
          },
          'week-2': { id: 'week-2', total: 3, position: 1 },
        },
      },
    },
  },
  work: {
    list1: {
      id: 'list1',
      labelIds: { urgent: 0, backend: 1 },
      items: { task1: { id: 'task1', labelIds: { backend: 0 } } },
    },
  },
  projects: { garden: { id: 'garden', description: 'Garden' } },
};

describe('v2Shape', () => {
  describe('convertTreeToV2', () => {
    describe('given the whole database', () => {
      it('reshapes every list into a map', () => {
        expect(convertTreeToV2('', v1Tree)).toEqual(v2Tree);
      });
    });

    describe('given a single item', () => {
      it('reshapes the lists inside it', () => {
        expect(
          convertTreeToV2('work/list1/items/task1', {
            id: 'task1',
            labelIds: ['backend'],
          }),
        ).toEqual({ id: 'task1', labelIds: { backend: 0 } });
      });
    });

    describe('given an empty list', () => {
      it('leaves it out, as Firebase does', () => {
        expect(
          convertTreeToV2('today/週/laundry', { id: 'laundry', completed: [] }),
        ).toEqual({ id: 'laundry' });
      });
    });

    describe('given a list Firebase has returned as an object', () => {
      it('reshapes its values', () => {
        expect(
          convertTreeToV2('today/週/laundry/completed', {
            0: '2026-10-05',
            3: '2026-10-07',
          }),
        ).toEqual({ t0000: '2026-10-05', t0001: '2026-10-07' });
      });
    });

    describe('given class blocks saved without ids', () => {
      it('keys them by position', () => {
        expect(
          convertTreeToV2('health/classes/pilates/blocks', [
            { total: 3 },
            { total: 3 },
          ]),
        ).toEqual({
          b0: { total: 3, position: 0 },
          b1: { total: 3, position: 1 },
        });
      });
    });

    describe('given a tracker that is not period data', () => {
      it('keeps it under its own key', () => {
        expect(
          convertTreeToV2('health/daily/2026-10-07/trackers', ['🔴', '💧']),
        ).toEqual({ heavyFlow: true, '💧': true });
      });
    });
  });

  describe('convertTreeToV1', () => {
    describe('given the whole v2 database', () => {
      it('reads every map back as the list it came from', () => {
        expect(convertTreeToV1('', v2Tree)).toEqual({
          ...v1Tree,
          health: {
            ...v1Tree.health,
            daily: {
              '2026-10-07': {
                ...v1Tree.health.daily['2026-10-07'],
                trackers: ['🟤', '🥚'],
              },
            },
          },
        });
      });
    });

    describe('given labels added at the same position on two devices', () => {
      it('orders them by id', () => {
        expect(
          convertTreeToV1('work/list1/labelIds', { zebra: 0, apple: 0 }),
        ).toEqual(['apple', 'zebra']);
      });
    });
  });

  describe('convertPathToV2', () => {
    describe('given a path through trackers', () => {
      it('renames it to period', () => {
        expect(convertPathToV2('health/daily/2026-10-07/trackers')).toBe(
          'health/daily/2026-10-07/period',
        );
      });
    });

    describe('given a path with nothing reshaped', () => {
      it('keeps it as it is', () => {
        expect(convertPathToV2('projects/garden/description')).toBe(
          'projects/garden/description',
        );
      });
    });
  });

  describe('convertUpdatesToV2', () => {
    const readV1Path = (path: string) =>
      path
        .split('/')
        .reduce<unknown>(
          (node, segment) => (node as Record<string, unknown>)?.[segment],
          v1Tree,
        );

    describe('given an update to a whole item', () => {
      it('writes the reshaped item under v2', () => {
        expect(
          convertUpdatesToV2(
            { 'today/週/laundry': v1Tree.today.週.laundry },
            readV1Path,
          ),
        ).toEqual({ 'v2/today/週/laundry': v2Tree.today.週.laundry });
      });
    });

    describe('given an update inside a reshaped list', () => {
      it('writes the whole reshaped list as it now stands', () => {
        expect(
          convertUpdatesToV2(
            { 'health/classes/pilates/blocks/0/completed': [0, 2] },
            readV1Path,
          ),
        ).toEqual({
          'v2/health/classes/pilates/blocks':
            v2Tree.health.classes.pilates.blocks,
        });
      });
    });

    describe('given a delete', () => {
      it('deletes the same path under v2', () => {
        expect(
          convertUpdatesToV2({ 'projects/garden': null }, readV1Path),
        ).toEqual({ 'v2/projects/garden': null });
      });
    });

    describe('given an update that leaves a reshaped list empty', () => {
      it('deletes the list under v2', () => {
        expect(
          convertUpdatesToV2(
            { 'health/daily/2026-10-07/trackers': [] },
            () => [],
          ),
        ).toEqual({ 'v2/health/daily/2026-10-07/period': null });
      });
    });
  });

  describe('reading a v1 key from v2', () => {
    describe('given a key above the reshaped lists', () => {
      const key = 'health/classes';

      it('reads the same path under v2', () => {
        expect(findV2ReadPath(key)).toBe('v2/health/classes');
      });

      it('converts the value back to the v1 shape', () => {
        expect(convertReadValueToV1(key, v2Tree.health.classes)).toEqual(
          v1Tree.health.classes,
        );
      });
    });

    describe('given a key inside a reshaped list', () => {
      const key = 'health/daily/2026-10-07/trackers/0';

      it('reads the whole list from v2', () => {
        expect(findV2ReadPath(key)).toBe('v2/health/daily/2026-10-07/period');
      });

      it('returns the entry from the converted list', () => {
        expect(convertReadValueToV1(key, { ovaryPain: true })).toBe('🥚');
      });
    });
  });

  describe('createV2Copy', () => {
    describe('given a database that already has a v2 copy', () => {
      it('reshapes everything else and leaves the old copy out', () => {
        expect(createV2Copy({ ...v1Tree, v2: { stale: true } })).toEqual(
          v2Tree,
        );
      });
    });
  });

  describe('listVersionDifferences', () => {
    describe('given a database whose v2 copy matches', () => {
      it('finds nothing', () => {
        expect(listVersionDifferences({ ...v1Tree, v2: v2Tree })).toEqual([]);
      });
    });

    describe('given a database whose v2 copy is behind', () => {
      it('lists what v2 is missing', () => {
        const { projects, ...v2WithoutProjects } = v2Tree;

        expect(
          listVersionDifferences({ ...v1Tree, v2: v2WithoutProjects }),
        ).toEqual(['projects']);
      });
    });
  });

  describe('listDifferences', () => {
    describe('given matching trees', () => {
      it('finds nothing', () => {
        expect(listDifferences(v2Tree, structuredClone(v2Tree))).toEqual([]);
      });
    });

    describe('given trees that differ', () => {
      it('lists the path of each difference', () => {
        expect(
          listDifferences(
            { a: { b: 1, c: [1, 2] }, d: 'same' },
            { a: { b: 2, c: [1, 2], e: true }, d: 'same' },
          ),
        ).toEqual(['a/b', 'a/e']);
      });
    });
  });
});
