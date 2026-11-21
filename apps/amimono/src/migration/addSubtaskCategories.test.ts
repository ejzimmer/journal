import { Database } from 'firebase/database';
import {
  mockUpdate,
  resetMockDatabase,
  setMockServerData,
} from 'shared/localFirst/firebaseDatabaseTestUtils';
import { addSubtaskCategories } from './addSubtaskCategories';

jest.mock(
  'firebase/database',
  () =>
    jest.requireActual('shared/localFirst/firebaseDatabaseTestUtils')
      .firebaseDatabaseMock,
);

const database = {} as Database;

describe('adding categories to saved subtasks', () => {
  beforeEach(() => {
    resetMockDatabase();
    mockUpdate.mockClear();
  });

  describe('when some subtasks have no category', () => {
    it('gives each of them the yarn category', async () => {
      setMockServerData({
        v2: {
          amimono: {
            projects: {
              cardi: {
                id: 'cardi',
                subtasks: {
                  swatch: { id: 'swatch', description: 'Swatch' },
                  sleeves: {
                    id: 'sleeves',
                    description: 'Sleeves',
                    category: '🧶',
                  },
                },
              },
              hat: {
                id: 'hat',
                subtasks: { brim: { id: 'brim', description: 'Brim' } },
              },
            },
          },
        },
      });

      await addSubtaskCategories(database);

      expect(mockUpdate).toHaveBeenCalledWith({
        'cardi/subtasks/swatch/category': '🧶',
        'hat/subtasks/brim/category': '🧶',
      });
    });
  });
});
