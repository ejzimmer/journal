import 'fake-indexeddb/auto';
import { createOutbox, opsTouchPath } from './outbox';

function uniqueDbName() {
  return `outbox-test-${Math.random()}`;
}

describe('createOutbox', () => {
  it('lists enqueued ops in FIFO order', async () => {
    const outbox = createOutbox(uniqueDbName());

    await outbox.enqueue({ updates: { a: 1 } });
    await outbox.enqueue({ updates: { b: 2 } });
    await outbox.enqueue({ updates: { c: 3 } });

    const ops = await outbox.list();
    expect(ops.map((op) => op.updates)).toEqual([{ a: 1 }, { b: 2 }, { c: 3 }]);
  });

  it('removes an op by id', async () => {
    const outbox = createOutbox(uniqueDbName());
    await outbox.enqueue({ updates: { a: 1 } });
    await outbox.enqueue({ updates: { b: 2 } });

    const [first] = await outbox.list();
    await outbox.remove(first.id);

    const remaining = await outbox.list();
    expect(remaining.map((op) => op.updates)).toEqual([{ b: 2 }]);
  });

  it('persists across separate outbox instances for the same db name', async () => {
    const dbName = uniqueDbName();
    const outbox1 = createOutbox(dbName);
    await outbox1.enqueue({ updates: { a: 1 } });

    const outbox2 = createOutbox(dbName);
    const ops = await outbox2.list();
    expect(ops.map((op) => op.updates)).toEqual([{ a: 1 }]);
  });

  it('enqueues and lists an atomic multi-path update', async () => {
    const outbox = createOutbox(uniqueDbName());
    const updates = { 'work/list1/task1': null, 'work/list2/task1': {} };

    await outbox.enqueue({ updates });

    const [op] = await outbox.list();
    expect(op).toEqual({ id: 1, updates });
  });

  it('peekFront returns the oldest op without removing it', async () => {
    const outbox = createOutbox(uniqueDbName());
    await outbox.enqueue({ updates: { a: 1 } });
    await outbox.enqueue({ updates: { b: 2 } });

    const front = await outbox.peekFront();

    expect(front?.updates).toEqual({ a: 1 });
    expect((await outbox.list()).map((op) => op.updates)).toEqual([
      { a: 1 },
      { b: 2 },
    ]);
  });

  it('peekFront returns undefined for an empty outbox', async () => {
    const outbox = createOutbox(uniqueDbName());
    expect(await outbox.peekFront()).toBeUndefined();
  });

  describe('when ops are enqueued without waiting for each other', () => {
    it('keeps every op, in the order they were enqueued', async () => {
      const outbox = createOutbox(uniqueDbName());

      await Promise.all([
        outbox.enqueue({ updates: { a: 1 } }),
        outbox.enqueue({ updates: { b: 2 } }),
        outbox.enqueue({ updates: { c: 3 } }),
      ]);

      const ops = await outbox.list();
      expect(ops.map((op) => op.updates)).toEqual([
        { a: 1 },
        { b: 2 },
        { c: 3 },
      ]);
    });
  });
});

describe('opsTouchPath', () => {
  it('is true for an exact match', () => {
    const ops = [{ id: 1, updates: { 'work/list1': {} } }];
    expect(opsTouchPath(ops, 'work/list1')).toBe(true);
  });

  it('is true when the pending op is nested under the queried path', () => {
    const ops = [{ id: 1, updates: { 'work/list1/items/task1': {} } }];
    expect(opsTouchPath(ops, 'work')).toBe(true);
  });

  it('is false when nothing pending touches the path', () => {
    const ops = [{ id: 1, updates: { 'work/list1': {} } }];
    expect(opsTouchPath(ops, 'labels')).toBe(false);
  });

  it("is true when any of a multi-write op's updates include the path", () => {
    const ops = [
      {
        id: 1,
        updates: { 'work/list1/task1': {}, 'work/list2/task1': null },
      },
    ];
    expect(opsTouchPath(ops, 'work/list2/task1')).toBe(true);
  });
});
