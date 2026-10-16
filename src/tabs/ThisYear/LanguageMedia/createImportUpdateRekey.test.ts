import { createImportUpdateRekey } from './createImportUpdateRekey';
import { StoredMediaByYear } from './types';

const importUpdate = {
  at: '2026-10-03T03:07:38Z',
  changes: { status: { to: 'done' } },
};

describe('createImportUpdateRekey', () => {
  describe('for updates kept under the key "migration"', () => {
    it('moves each one to a new key, however deep it is', () => {
      let count = 0;
      const store = {
        2026: {
          roshar: {
            id: 'roshar',
            updates: { migration: importUpdate },
            volumes: { v1: { id: 'v1', updates: { migration: importUpdate } } },
          },
        },
      } as unknown as StoredMediaByYear;

      expect(createImportUpdateRekey(store, () => `id-${++count}`)).toEqual({
        'language_media/2026/roshar/updates/migration': null,
        'language_media/2026/roshar/updates/id-1': importUpdate,
        'language_media/2026/roshar/volumes/v1/updates/migration': null,
        'language_media/2026/roshar/volumes/v1/updates/id-2': importUpdate,
      });
    });
  });

  describe('once none are left', () => {
    it('has nothing to change', () => {
      const store = {
        2026: { roshar: { id: 'roshar', updates: { u1: importUpdate } } },
      } as unknown as StoredMediaByYear;

      expect(createImportUpdateRekey(store, () => 'id')).toEqual({});
    });
  });
});
