import { Database } from 'firebase/database';
import {
  mockUpdate,
  resetMockDatabase,
  setMockServerData,
} from 'shared/localFirst/firebaseDatabaseTestUtils';
import { convertProjectsToSharedShape } from './convertProjectsToSharedShape';

jest.mock(
  'firebase/database',
  () =>
    jest.requireActual('shared/localFirst/firebaseDatabaseTestUtils')
      .firebaseDatabaseMock,
);

const database = {} as Database;

describe('converting saved projects to the shared project shape', () => {
  beforeEach(() => {
    resetMockDatabase();
    mockUpdate.mockClear();
  });

  describe('when some projects were saved with a name and no category', () => {
    it('moves each name to the description and adds the yarn category', async () => {
      setMockServerData({
        v2: {
          amimono: {
            projects: {
              cardi: { id: 'cardi', name: 'Cardigan', type: 'cardigan' },
              hat: {
                id: 'hat',
                description: 'Hat',
                category: '🧶',
                type: 'hat',
              },
            },
          },
        },
      });

      await convertProjectsToSharedShape(database);

      expect(mockUpdate).toHaveBeenCalledWith({
        'cardi/description': 'Cardigan',
        'cardi/name': null,
        'cardi/category': '🧶',
      });
    });
  });
});
