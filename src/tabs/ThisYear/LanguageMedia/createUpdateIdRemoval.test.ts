import { createUpdateIdRemoval } from './createUpdateIdRemoval';
import { StoredMediaByYear } from './types';

const update = { at: '2026-10-03T09:00:00Z', changes: {} };

describe('createUpdateIdRemoval', () => {
  describe('for updates that carry a copy of their own key', () => {
    it('removes the copy, however deep the update is', () => {
      const store = {
        2026: {
          lupin: {
            id: 'lupin',
            updates: { u1: { ...update, id: 'u1' } },
            seasons: {
              s1: {
                id: 's1',
                episodes: {
                  e1: { id: 'e1', updates: { u2: { ...update, id: 'u2' } } },
                },
              },
            },
          },
        },
      } as unknown as StoredMediaByYear;

      expect(createUpdateIdRemoval(store)).toEqual({
        'language_media/2026/lupin/updates/u1/id': null,
        'language_media/2026/lupin/seasons/s1/episodes/e1/updates/u2/id': null,
      });
    });
  });

  describe('once no update carries one', () => {
    it('has nothing to change', () => {
      const store = {
        2026: { lupin: { id: 'lupin', updates: { u1: update } } },
      } as unknown as StoredMediaByYear;

      expect(createUpdateIdRemoval(store)).toEqual({});
    });
  });
});
