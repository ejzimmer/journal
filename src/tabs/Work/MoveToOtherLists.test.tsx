import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MoveToOtherLists } from './MoveToOtherLists';
import { WorkStorageContext } from './WorkStorageContext';
import { createWorkStorageContext } from './workStorageTestUtils';
import { WorkTask } from './types';

function createList(
  id: string,
  description: string,
  position: number,
  extra: Partial<WorkTask> = {},
): WorkTask {
  return {
    id,
    description,
    status: 'not_started',
    parentId: 'work',
    lastStatusUpdate: '2026-01-01',
    position,
    ...extra,
  };
}

function createTask(
  parentListId: string,
  labelIds?: string[],
  description = 'Fix contrast',
): WorkTask {
  return {
    id: 'task-1',
    description,
    status: 'not_started',
    parentId: `work/${parentListId}/items`,
    lastStatusUpdate: '2026-01-01',
    position: 0,
    labelIds,
  };
}

const backlog = createList('list-backlog', 'Backlog', 0);
const today = createList('list-today', 'Today', 1);
const a11y = createList('list-a11y', 'a11y', 2, { labelIds: ['label-a11y'] });
const design = createList('list-design', 'Design', 3, {
  labelIds: ['label-design'],
});
const featureGates = createList('list-feature-gates', 'Feature gates', 4);
const allLists = [backlog, today, a11y, design, featureGates];

function showMenuItems(currentList: WorkTask, task: WorkTask) {
  const storageContext = createWorkStorageContext();
  render(
    <WorkStorageContext.Provider value={storageContext}>
      <MoveToOtherLists
        allLists={allLists}
        currentListId={currentList.id}
        task={task}
      />
    </WorkStorageContext.Provider>,
  );
  return storageContext;
}

function expectDividerAfter(...names: string[]) {
  const separator = screen.getByRole('separator');
  const items = screen.getAllByRole('menuitem');
  const lastPriority = items[names.length - 1];
  const firstRemaining = items[names.length];

  expect(items.slice(0, names.length).map((item) => item.textContent)).toEqual(
    names,
  );
  expect(lastPriority.compareDocumentPosition(separator)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
  expect(separator.compareDocumentPosition(firstRemaining)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING,
  );
}

function getMenuItemNames() {
  return screen.getAllByRole('menuitem').map((item) => item.textContent ?? '');
}

describe('MoveToOtherLists', () => {
  it('moves the task to the clicked list', async () => {
    const user = userEvent.setup();
    const task = createTask(backlog.id);
    const storageContext = showMenuItems(backlog, task);

    await user.click(screen.getByRole('menuitem', { name: 'Design' }));

    expect(storageContext.moveTask).toHaveBeenCalledWith(
      expect.objectContaining({
        task,
        sourceListId: 'work/list-backlog/items',
        targetListId: 'work/list-design/items',
        movedItem: expect.objectContaining({ id: task.id }),
      }),
    );
  });

  describe('when the task is not in Today', () => {
    it('puts Today at the top, followed by the other lists in order', () => {
      showMenuItems(backlog, createTask(backlog.id, ['label-design']));

      expect(getMenuItemNames()).toEqual([
        'Today',
        'a11y',
        'Design',
        'Feature gates',
      ]);
    });

    it('separates Today from the other lists with a divider', () => {
      showMenuItems(backlog, createTask(backlog.id, ['label-design']));

      expectDividerAfter('Today');
    });
  });

  describe('when the task is in Today', () => {
    describe('and has a label belonging to another list', () => {
      it('puts that list at the top, followed by the other lists in order', () => {
        showMenuItems(today, createTask(today.id, ['label-design']));

        expect(getMenuItemNames()).toEqual([
          'Design',
          'Backlog',
          'a11y',
          'Feature gates',
        ]);
      });

      it('separates that list from the other lists with a divider', () => {
        showMenuItems(today, createTask(today.id, ['label-design']));

        expectDividerAfter('Design');
      });
    });

    describe('and has no label belonging to another list', () => {
      it('lists the other lists in order', () => {
        showMenuItems(today, createTask(today.id, ['label-other']));

        expect(getMenuItemNames()).toEqual([
          'Backlog',
          'a11y',
          'Design',
          'Feature gates',
        ]);
      });
    });

    describe('and is named like a feature gate', () => {
      const featureGateTask = (labelIds?: string[]) =>
        createTask(today.id, labelIds, 'new-checkout-2');

      it('puts Feature gates at the top, followed by the other lists in order', () => {
        showMenuItems(today, featureGateTask());

        expect(getMenuItemNames()).toEqual([
          'Feature gates',
          'Backlog',
          'a11y',
          'Design',
        ]);
      });

      it('separates Feature gates from the other lists with a divider', () => {
        showMenuItems(today, featureGateTask());

        expectDividerAfter('Feature gates');
      });

      describe('and has a label belonging to another list', () => {
        it('puts that list then Feature gates above the divider', () => {
          showMenuItems(today, featureGateTask(['label-design']));

          expectDividerAfter('Design', 'Feature gates');
        });
      });

      describe('with surrounding spaces or a trailing [hhmm] timestamp', () => {
        it.each([
          '  new-checkout-2  ',
          'new-checkout-2[0930]',
          'new-checkout-2 [0930]',
          ' new-checkout-2 [0930] ',
        ])('puts Feature gates at the top for "%s"', (description) => {
          showMenuItems(today, createTask(today.id, [], description));

          expect(getMenuItemNames()[0]).toBe('Feature gates');
        });
      });
    });

    describe('and has a timestamp that is not in [hhmm] form', () => {
      it.each(['new-checkout-2 [930]', 'new-checkout-2 0930'])(
        'lists Feature gates in order with the other lists for "%s"',
        (description) => {
          showMenuItems(today, createTask(today.id, [], description));

          expect(getMenuItemNames()).toEqual([
            'Backlog',
            'a11y',
            'Design',
            'Feature gates',
          ]);
        },
      );
    });

    describe('and has a name with capitals or spaces', () => {
      it('lists Feature gates in order with the other lists', () => {
        showMenuItems(today, createTask(today.id, [], 'New checkout'));

        expect(getMenuItemNames()).toEqual([
          'Backlog',
          'a11y',
          'Design',
          'Feature gates',
        ]);
      });
    });
  });
});
