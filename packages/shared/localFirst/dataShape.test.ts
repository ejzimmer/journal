import { createSubtreeDataShape, PLAIN_DATA_SHAPE } from './dataShape';

describe('createSubtreeDataShape', () => {
  const amimonoShape = createSubtreeDataShape('amimono');

  describe('finding where an app path is stored', () => {
    it('puts the path under the subtree in v2', () => {
      expect(amimonoShape.findStoredPath('projects/abc')).toBe(
        'v2/amimono/projects/abc',
      );
    });
  });

  describe('converting updates', () => {
    it('moves every path under the subtree in v2', () => {
      expect(
        amimonoShape.convertUpdates({ 'projects/abc/name': 'Hat' }, () => null),
      ).toEqual({ 'v2/amimono/projects/abc/name': 'Hat' });
    });

    it('turns a removal into a null write', () => {
      expect(
        amimonoShape.convertUpdates({ 'projects/abc': undefined }, () => null),
      ).toEqual({ 'v2/amimono/projects/abc': null });
    });
  });

  describe('reading a stored value', () => {
    it('returns it unchanged', () => {
      const project = { name: 'Hat' };

      expect(amimonoShape.convertStoredValue('projects/abc', project)).toBe(
        project,
      );
    });
  });
});

describe('createSubtreeDataShape with shared paths', () => {
  const amimonoShape = createSubtreeDataShape('amimono', ['今日/slots']);

  describe('finding where an app path is stored', () => {
    it('puts a shared path directly under v2', () => {
      expect(amimonoShape.findStoredPath('今日/slots/abc')).toBe(
        'v2/今日/slots/abc',
      );
    });

    it('puts any other path under the subtree', () => {
      expect(amimonoShape.findStoredPath('今日/slotsReset')).toBe(
        'v2/amimono/今日/slotsReset',
      );
    });
  });

  describe('converting updates', () => {
    it('sends each path to where it is stored', () => {
      expect(
        amimonoShape.convertUpdates(
          { '今日/slots/abc': { position: 0 }, 'projects/abc/name': 'Hat' },
          () => null,
        ),
      ).toEqual({
        'v2/今日/slots/abc': { position: 0 },
        'v2/amimono/projects/abc/name': 'Hat',
      });
    });
  });
});

describe('PLAIN_DATA_SHAPE', () => {
  it('stores app paths directly under v2', () => {
    expect(PLAIN_DATA_SHAPE.findStoredPath('projects/abc')).toBe(
      'v2/projects/abc',
    );
  });
});
