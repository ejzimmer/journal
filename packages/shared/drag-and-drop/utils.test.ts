import { getNextPosition, renumberPositions, sortByPosition } from './utils';

describe('sortByPosition', () => {
  it('orders items by their position', () => {
    const sorted = sortByPosition([
      { id: 'c', position: 4 },
      { id: 'a', position: 0 },
      { id: 'b', position: 3 },
    ]);

    expect(sorted.map((item) => item.id)).toEqual(['a', 'b', 'c']);
  });

  it('leaves the stored positions alone', () => {
    const sorted = sortByPosition([
      { id: 'b', position: 3 },
      { id: 'a', position: 0 },
    ]);

    expect(sorted.map((item) => item.position)).toEqual([0, 3]);
  });

  it("breaks ties by id so the order doesn't depend on the input order", () => {
    const first = sortByPosition([
      { id: 'b', position: 1 },
      { id: 'a', position: 1 },
    ]);
    const second = sortByPosition([
      { id: 'a', position: 1 },
      { id: 'b', position: 1 },
    ]);

    expect(first.map((item) => item.id)).toEqual(['a', 'b']);
    expect(second.map((item) => item.id)).toEqual(['a', 'b']);
  });
});

describe('renumberPositions', () => {
  it('replaces positions with consecutive indexes', () => {
    const renumbered = renumberPositions([
      { id: 'a', position: 0 },
      { id: 'b', position: 3 },
      { id: 'c', position: 7 },
    ]);

    expect(renumbered.map((item) => item.position)).toEqual([0, 1, 2]);
  });
});

describe('getNextPosition', () => {
  it('returns 0 for an empty list', () => {
    expect(getNextPosition([])).toBe(0);
  });

  it('returns one past the highest position', () => {
    expect(
      getNextPosition([
        { id: 'a', position: 0 },
        { id: 'b', position: 5 },
      ]),
    ).toBe(6);
  });

  it('ignores items with no position', () => {
    expect(
      getNextPosition([
        { id: 'a', position: undefined as unknown as number },
        { id: 'b', position: 2 },
      ]),
    ).toBe(3);
  });
});
