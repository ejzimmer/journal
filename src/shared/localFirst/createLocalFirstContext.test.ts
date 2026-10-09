import 'fake-indexeddb/auto';
import { renderHook, waitFor } from '@testing-library/react';
import { createLocalFirstContext, ReadSource } from './createLocalFirstContext';

const mockUpdate = jest.fn().mockResolvedValue(undefined);
const mockOnValueCallbacks = new Map<
  string,
  (snapshot: { val: () => unknown }) => void
>();

jest.mock('firebase/database', () => ({
  ref: (_database: unknown, path?: string) => ({ path }),
  update: (_reference: unknown, updates: Record<string, unknown>) =>
    mockUpdate(updates),
  onValue: (
    reference: { path: string },
    callback: (snapshot: { val: () => unknown }) => void,
  ) => {
    mockOnValueCallbacks.set(reference.path, callback);
    return () => mockOnValueCallbacks.delete(reference.path);
  },
}));

function fireRemoteSnapshot(path: string, value: unknown) {
  mockOnValueCallbacks.get(path)?.({ val: () => value });
}

function uniqueDbName() {
  return `local-first-context-test-${Math.random()}`;
}

// idb-keyval uses an implementation of setImmediate which doesn't work with
// Jest fakeTimer utils, so we need to do this the old fashioned way
async function flushMicrotasks() {
  for (let i = 0; i < 10; i++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

async function setUpContext(readSource: ReadSource = 'v1') {
  const { context, hydrate } = createLocalFirstContext(
    {} as import('firebase/database').Database,
    uniqueDbName(),
    readSource,
  );
  await hydrate();
  return context;
}

beforeEach(() => {
  mockOnValueCallbacks.clear();
});

describe('createLocalFirstContext', () => {
  it('addItem writes locally immediately and is readable via useValue', async () => {
    const context = await setUpContext();

    const id = context.addItem<{ id: string; description: string }>('work', {
      description: 'Chores',
    });

    const { result } = renderHook(() =>
      context.useValue<Record<string, { description: string }>>('work'),
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.value?.[id!].description).toBe('Chores');
  });

  it('addItem enqueues a write op that the sync engine pushes to Firebase', async () => {
    const context = await setUpContext();

    const id = context.addItem<{ id: string; description: string }>('work', {
      description: 'Chores',
    });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        [`work/${id}`]: expect.objectContaining({ description: 'Chores' }),
        [`v2/work/${id}`]: expect.objectContaining({ description: 'Chores' }),
      });
    });
  });

  it('deleteItem removes the item locally and syncs the deletion to the real database', async () => {
    const context = await setUpContext();
    const item = { id: 'task1', description: 'Chores' };
    context.updateItem('work', item);

    context.deleteItem('work', item);

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>('work'),
    );
    expect(result.current.value).toBeUndefined();

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        'work/task1': null,
        'v2/work/task1': null,
      });
    });
  });

  it('ignores a write that matches what is already stored', async () => {
    const context = await setUpContext();
    const item = { id: 'task1', description: 'Chores' };
    context.updateItem('work', item);
    await flushMicrotasks();
    mockUpdate.mockClear();

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>('work'),
    );
    const storedBefore = result.current.value;

    context.updateItem('work', { ...item });
    await flushMicrotasks();

    expect(result.current.value).toBe(storedBefore);
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('still writes a deletion for a value that is already gone', async () => {
    const context = await setUpContext();

    context.deleteItem('work', { id: 'task1', description: 'Chores' });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        'work/task1': null,
        'v2/work/task1': null,
      });
    });
  });

  it('setValue stores a bare primitive, not just objects', async () => {
    const context = await setUpContext();

    context.setValue('dailyReset', 12345);

    const { result } = renderHook(() => context.useValue<number>('dailyReset'));
    expect(result.current.value).toBe(12345);
  });

  it('setValues writes every path locally and syncs them as one atomic update', async () => {
    const context = await setUpContext();
    context.setValue('old', { a: 1 });

    context.setValues({ 'new/a': 1, old: null });

    const { result: moved } = renderHook(() =>
      context.useValue<Record<string, unknown>>('new'),
    );
    const { result: removed } = renderHook(() => context.useValue('old'));
    expect(moved.current.value).toEqual({ a: 1 });
    expect(removed.current.value).toBeUndefined();

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        'new/a': 1,
        old: null,
        'v2/new/a': 1,
        'v2/old': null,
      });
    });
  });

  it('applies a remote snapshot when nothing local is pending for that key', async () => {
    const context = await setUpContext();
    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>('work'),
    );

    await waitFor(() => expect(mockOnValueCallbacks.has('work')).toBe(true));

    fireRemoteSnapshot('work', {
      task1: { id: 'task1', description: 'Remote' },
    });

    await waitFor(() => {
      expect(result.current.value).toEqual({
        task1: { id: 'task1', description: 'Remote' },
      });
    });
  });

  it('moveItemBetweenLists writes both lists locally and syncs as one atomic update', async () => {
    const context = await setUpContext();
    const movedItem = { id: 'task1', position: 0 };
    const stayingItem = { id: 'task2', position: 0 };
    context.updateItem('work/list2/items', stayingItem);

    context.moveItemBetweenLists({
      movedItem,
      sourceListId: 'work/list1/items',
      targetListId: 'work/list2/items',
      targetListItems: [stayingItem],
    });

    const { result: source } = renderHook(() =>
      context.useValue<Record<string, unknown>>('work/list1/items'),
    );
    const { result: target } = renderHook(() =>
      context.useValue<Record<string, unknown>>('work/list2/items'),
    );
    expect(source.current.value?.task1).toBeUndefined();
    expect(target.current.value?.task1).toEqual(movedItem);
    expect(target.current.value?.task2).toEqual({ id: 'task2', position: 1 });

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith({
        'work/list2/items/task1': movedItem,
        'work/list1/items/task1': null,
        'work/list2/items/task2/position': 1,
        'v2/work/list2/items/task1': movedItem,
        'v2/work/list1/items/task1': null,
        'v2/work/list2/items/task2/position': 1,
      });
    });
  });

  it('keeps an unsynced local write on top of a remote snapshot for that key', async () => {
    const context = await setUpContext();
    mockUpdate.mockImplementation(() => new Promise(() => {}));
    const item = { id: 'task1', description: 'Local edit' };

    context.updateItem('work', item);

    const { result } = renderHook(() =>
      context.useValue<Record<string, unknown>>('work'),
    );
    await waitFor(() => expect(mockOnValueCallbacks.has('work')).toBe(true));

    fireRemoteSnapshot('work', {
      task1: { id: 'task1', description: 'Stale' },
      task2: { id: 'task2', description: 'Added elsewhere' },
    });

    await waitFor(() => {
      expect(result.current.value).toEqual({
        task1: item,
        task2: { id: 'task2', description: 'Added elsewhere' },
      });
    });
  });

  describe('synced', () => {
    describe('before a remote snapshot has arrived', () => {
      it('is false, even when a value is cached locally', async () => {
        const context = await setUpContext();
        context.setValue('work', { task1: { id: 'task1' } });

        const { result } = renderHook(() => context.useValue('work'));

        expect(result.current.value).toEqual({ task1: { id: 'task1' } });
        expect(result.current.synced).toBe(false);
      });
    });

    describe('once a remote snapshot has arrived', () => {
      it('is true for that key', async () => {
        const context = await setUpContext();
        const { result } = renderHook(() => context.useValue('work'));
        await waitFor(() =>
          expect(mockOnValueCallbacks.has('work')).toBe(true),
        );

        fireRemoteSnapshot('work', {});

        await waitFor(() => expect(result.current.synced).toBe(true));
      });

      it('is true for keys nested under it', async () => {
        const context = await setUpContext();
        renderHook(() => context.useValue('work'));
        await waitFor(() =>
          expect(mockOnValueCallbacks.has('work')).toBe(true),
        );
        const { result: nested } = renderHook(() =>
          context.useValue('work/list1'),
        );

        fireRemoteSnapshot('work', {});

        await waitFor(() => expect(nested.current.synced).toBe(true));
      });
    });
  });

  describe('saving a reshaped list', () => {
    const task = {
      id: 'laundry',
      description: 'Laundry',
      completed: ['2026-10-05', '2026-10-07'],
    };
    const v2Task = {
      id: 'laundry',
      description: 'Laundry',
      completed: { t0000: '2026-10-05', t0001: '2026-10-07' },
    };

    it('sends the v1 shape and the v2 shape in one update', async () => {
      const context = await setUpContext();

      context.updateItem('today/週', task);

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith({
          'today/週/laundry': task,
          'v2/today/週/laundry': v2Task,
        });
      });
    });
  });

  describe('reading from v2', () => {
    const v2Classes = {
      pilates: {
        id: 'pilates',
        blocks: {
          'week-1': {
            id: 'week-1',
            total: 3,
            position: 0,
            completed: { s1: true },
          },
        },
      },
    };
    const v1Classes = {
      pilates: {
        id: 'pilates',
        blocks: [{ id: 'week-1', total: 3, completed: [1] }],
      },
    };

    it('listens to the matching path under v2', async () => {
      const context = await setUpContext('v2');

      renderHook(() => context.useValue('health/classes'));

      await waitFor(() =>
        expect(mockOnValueCallbacks.has('v2/health/classes')).toBe(true),
      );
    });

    describe('when the server sends its copy', () => {
      it('returns it in the v1 shape', async () => {
        const context = await setUpContext('v2');
        const { result } = renderHook(() => context.useValue('health/classes'));
        await waitFor(() =>
          expect(mockOnValueCallbacks.has('v2/health/classes')).toBe(true),
        );

        fireRemoteSnapshot('v2/health/classes', v2Classes);

        await waitFor(() => expect(result.current.value).toEqual(v1Classes));
        expect(result.current.synced).toBe(true);
      });
    });

    describe('when the app saves a change', () => {
      it('returns the change in the v1 shape', async () => {
        const context = await setUpContext('v2');
        const { result } = renderHook(() => context.useValue('health/classes'));

        context.updateItem('health/classes', v1Classes.pilates);

        await waitFor(() => expect(result.current.value).toEqual(v1Classes));
      });
    });
  });
});
