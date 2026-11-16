import { Database } from 'firebase/database';
import {
  mockUpdate,
  resetMockDatabase,
  setMockServerData,
} from 'shared/localFirst/firebaseDatabaseTestUtils';
import { convertPortablePositions } from './convertPortablePositions';

jest.mock(
  'firebase/database',
  () =>
    jest.requireActual('shared/localFirst/firebaseDatabaseTestUtils')
      .firebaseDatabaseMock,
);

const database = {} as Database;

describe('converting saved portable positions', () => {
  beforeEach(() => {
    resetMockDatabase();
    mockUpdate.mockClear();
  });

  describe('when a priority project has a saved portable position', () => {
    it('saves it as its previous spot in portable', async () => {
      setMockServerData({
        v2: {
          amimono: {
            lists: {
              priority: {
                cardi: { id: 'cardi', position: 1, portablePosition: 3 },
                hat: { id: 'hat', position: 2 },
              },
            },
          },
        },
      });

      await convertPortablePositions(database);

      expect(mockUpdate).toHaveBeenCalledWith({
        'priority/cardi/previous': { list: 'portable', position: 3 },
        'priority/cardi/portablePosition': null,
      });
    });
  });
});
