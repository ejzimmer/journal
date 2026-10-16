import { removeOverwrittenChanges } from './removeOverwrittenChanges';

describe('removeOverwrittenChanges', () => {
  describe('for a change inside a path that is being overwritten', () => {
    it('drops it', () => {
      expect(
        removeOverwrittenChanges({ 'a/updates/u1/id': null }, ['a/updates']),
      ).toEqual({});
    });
  });

  describe('for a change outside every overwritten path', () => {
    it('keeps it', () => {
      expect(
        removeOverwrittenChanges({ 'b/updates/u1/id': null }, ['a/updates']),
      ).toEqual({ 'b/updates/u1/id': null });
    });
  });

  describe('for a path that only starts with the same letters', () => {
    it('keeps it', () => {
      expect(
        removeOverwrittenChanges({ 'a/updatesOld/u1': null }, ['a/updates']),
      ).toEqual({ 'a/updatesOld/u1': null });
    });
  });
});
