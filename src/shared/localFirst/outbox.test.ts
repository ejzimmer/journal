import 'fake-indexeddb/auto';
import { createOutbox } from './outbox';

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

  describe('keepOnlyPathsUnder', () => {
    describe('given ops that save inside and outside the root', () => {
      it('keeps only the saves inside it, in the same order', async () => {
        const outbox = createOutbox(uniqueDbName());
        await outbox.enqueue({ updates: { 'v2/a': 1, a: 1 } });
        await outbox.enqueue({ updates: { b: 2 } });
        await outbox.enqueue({ updates: { 'v2/c': 3 } });

        await outbox.keepOnlyPathsUnder('v2');

        const ops = await outbox.list();
        expect(ops.map((op) => op.updates)).toEqual([
          { 'v2/a': 1 },
          { 'v2/c': 3 },
        ]);
      });
    });
  });
});
