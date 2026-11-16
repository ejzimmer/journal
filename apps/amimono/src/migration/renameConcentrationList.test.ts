import { Database } from 'firebase/database';
import {
  mockUpdate,
  resetMockDatabase,
  setMockServerData,
} from 'shared/localFirst/firebaseDatabaseTestUtils';
import { renameConcentrationList } from './renameConcentrationList';

jest.mock(
  'firebase/database',
  () =>
    jest.requireActual('shared/localFirst/firebaseDatabaseTestUtils')
      .firebaseDatabaseMock,
);

const database = {} as Database;

describe('renaming the concentration list', () => {
  beforeEach(() => {
    resetMockDatabase();
    mockUpdate.mockClear();
  });

  describe('when projects are stored in the concentration list', () => {
    it('moves them to the priority list', async () => {
      setMockServerData({
        v2: {
          amimono: {
            lists: {
              concentration: { cardi: { id: 'cardi', position: 1 } },
            },
          },
        },
      });

      await renameConcentrationList(database);

      expect(mockUpdate).toHaveBeenCalledWith({
        'priority/cardi': { id: 'cardi', position: 1 },
        concentration: null,
      });
    });
  });
});
