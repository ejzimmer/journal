import { sortAdventures } from './sortAdventures';
import { Adventure } from './types';

const createAdventure = (
  id: string,
  details: Partial<Adventure> = {},
): Adventure => ({
  id,
  description: id,
  modeId: 'running',
  isDone: false,
  ...details,
});

const sortIds = (adventures: Adventure[]) =>
  sortAdventures(adventures).map(({ id }) => id);

describe('sortAdventures', () => {
  describe('when some adventures are done', () => {
    it('puts them after the ones still to do', () => {
      expect(
        sortIds([
          createAdventure('done', { isDone: true, plannedDate: '2026-01-01' }),
          createAdventure('to do'),
        ]),
      ).toEqual(['to do', 'done']);
    });
  });

  describe('when adventures have planned dates', () => {
    it('puts the soonest first', () => {
      expect(
        sortIds([
          createAdventure('december', { plannedDate: '2026-12-06' }),
          createAdventure('october', { plannedDate: '2026-10-17' }),
        ]),
      ).toEqual(['october', 'december']);
    });

    it('puts adventures with no date after them', () => {
      expect(
        sortIds([
          createAdventure('someday'),
          createAdventure('october', { plannedDate: '2026-10-17' }),
        ]),
      ).toEqual(['october', 'someday']);
    });
  });
});
