import { Database } from 'firebase/database';
import {
  mockUpdate,
  resetMockDatabase,
  setMockServerData,
} from 'shared/localFirst/firebaseDatabaseTestUtils';
import { removeMigratedJournalData } from './removeMigratedJournalData';

jest.mock(
  'firebase/database',
  () =>
    jest.requireActual('shared/localFirst/firebaseDatabaseTestUtils')
      .firebaseDatabaseMock,
);

const database = {} as Database;

const journalProjects = {
  cardi: { id: 'cardi', description: 'Cardigan', category: '🧶' },
  mending: { id: 'mending', description: 'Darn socks', category: '🧶' },
  shelves: { id: 'shelves', description: 'Build shelves', category: '🧹' },
};
const journalYarn = { '2026': { wool: { id: 'wool', grams: 100 } } };

describe('removing migrated data from the journal', () => {
  beforeEach(() => {
    resetMockDatabase();
    mockUpdate.mockClear();
  });

  describe('once the migration has run', () => {
    beforeEach(() => {
      setMockServerData({
        v2: {
          projects: journalProjects,
          yarn: journalYarn,
          amimono: {
            migratedFromJournalAt: 1,
            projects: {
              cardi: { id: 'cardi', name: 'Cardigan', type: 'cardigan' },
              hat: { id: 'hat', name: 'Hat', type: 'hat' },
            },
          },
        },
      });
    });

    it('removes only the journal projects that are in Amimono, and the yarn', async () => {
      await removeMigratedJournalData(database);

      expect(mockUpdate).toHaveBeenCalledWith({
        'projects/cardi': null,
        yarn: null,
      });
    });
  });

  describe('when the journal has already been cleaned up', () => {
    it('leaves the remaining journal projects alone', async () => {
      setMockServerData({
        v2: {
          projects: { mending: journalProjects.mending },
          amimono: {
            migratedFromJournalAt: 1,
            projects: { cardi: { id: 'cardi', name: 'Cardigan' } },
          },
        },
      });

      await removeMigratedJournalData(database);

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  describe('before the migration has run', () => {
    it('leaves the journal untouched', async () => {
      setMockServerData({
        v2: {
          projects: journalProjects,
          yarn: journalYarn,
          amimono: { projects: { cardi: { id: 'cardi', name: 'Cardigan' } } },
        },
      });

      await removeMigratedJournalData(database);

      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });
});
