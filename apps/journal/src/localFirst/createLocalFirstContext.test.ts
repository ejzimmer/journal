import 'fake-indexeddb/auto';
import { renderHook, waitFor } from '@testing-library/react';
import { createLocalFirstContext } from 'shared/localFirst/createLocalFirstContext';
import {
  fireRemoteSnapshot,
  flushMicrotasks,
  getSentData,
  mockOnValueCallbacks,
  mockUpdate,
  resetMockDatabase,
} from 'shared/localFirst/firebaseDatabaseTestUtils';
import { JOURNAL_DATA_SHAPE } from './v2Shape';

jest.mock(
  'firebase/database',
  () =>
    jest.requireActual('shared/localFirst/firebaseDatabaseTestUtils')
      .firebaseDatabaseMock,
);

async function setUpContext() {
  const { context, hydrate } = createLocalFirstContext(
    {} as import('firebase/database').Database,
    `journal-context-test-${Math.random()}`,
    JOURNAL_DATA_SHAPE,
  );
  await hydrate();
  return context;
}

beforeEach(() => {
  resetMockDatabase();
});

describe('createLocalFirstContext with the journal data shape', () => {
  describe('ticking a weekly task that is already stored', () => {
    it('sends only the new tick', async () => {
      const context = await setUpContext();
      const task = { id: 'laundry', completed: ['2026-10-05'] };
      context.updateItem('today/週', task);
      await flushMicrotasks();
      mockUpdate.mockClear();

      context.updateItem('today/週', {
        ...task,
        completed: ['2026-10-05', '2026-10-07'],
      });

      await waitFor(() =>
        expect(getSentData()).toContainEqual({
          'v2/today/週/laundry/completed/t0001': '2026-10-07',
        }),
      );
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

    it('sends it in the v2 shape', async () => {
      const context = await setUpContext();

      context.updateItem('today/週', task);

      await waitFor(() => {
        expect(getSentData()).toContainEqual({
          'v2/today/週/laundry': v2Task,
        });
      });
    });
  });

  describe('saving inside a reshaped list', () => {
    it('sends only the part of the reshaped list that changed', async () => {
      const context = await setUpContext();
      context.updateItem('health/classes', {
        id: 'pilates',
        blocks: [{ id: 'week-1', total: 3 }],
      });

      context.setValue('health/classes/pilates/blocks/0/completed', [2]);

      await waitFor(() => {
        expect(getSentData()).toContainEqual({
          'v2/health/classes/pilates/blocks/week-1/completed': { s2: true },
        });
      });
    });
  });

  describe('reading a reshaped list', () => {
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

    it('listens to the same path under v2', async () => {
      const context = await setUpContext();

      renderHook(() => context.useValue('health/classes'));

      await waitFor(() =>
        expect(mockOnValueCallbacks.has('v2/health/classes')).toBe(true),
      );
    });

    describe('when the server sends its copy', () => {
      it('returns it in the v1 shape', async () => {
        const context = await setUpContext();
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
        const context = await setUpContext();
        const { result } = renderHook(() => context.useValue('health/classes'));

        context.updateItem('health/classes', v1Classes.pilates);

        await waitFor(() => expect(result.current.value).toEqual(v1Classes));
      });
    });
  });
});
