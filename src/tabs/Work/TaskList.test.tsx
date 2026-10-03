import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';
import {
  WorkStorageContext,
  WorkStorageContextType,
  WorkStorageProvider,
} from './WorkStorageContext';
import { FirebaseContext } from '../../shared/FirebaseContext';
import { createMockFirebaseContext } from '../../shared/mockFirebase';
import { createWorkStorageContext } from './workStorageTestUtils';
import { WorkTask, StoredLabel } from './types';

const a11yLabel: StoredLabel = { id: 'id-a11y', value: 'a11y', colour: 'blue' };
const urgentLabel: StoredLabel = {
  id: 'id-urgent',
  value: 'urgent',
  colour: 'yellow',
};

const labelledList: WorkTask = {
  id: 'list-1',
  description: 'a11y backlog',
  status: 'not_started',
  parentId: 'work',
  lastStatusUpdate: '2026-01-01',
  position: 0,
  labelIds: [a11yLabel.id],
};

const unlabelledList: WorkTask = {
  id: 'list-2',
  description: 'Today',
  status: 'not_started',
  parentId: 'work',
  lastStatusUpdate: '2026-01-01',
  position: 1,
  items: {
    'task-1': {
      id: 'task-1',
      description: 'not done',
      status: 'not_started',
      parentId: 'list-2',
      lastStatusUpdate: '2026-01-01',
      position: 0,
    },
    'task-2': {
      id: 'task-2',
      description: 'also not done',
      status: 'not_started',
      parentId: 'list-2',
      lastStatusUpdate: '2026-01-01',
      position: 1,
    },
    'task-3': {
      id: 'task-3',
      description: 'done',
      status: 'done',
      parentId: 'list-2',
      lastStatusUpdate: '2026-01-01',
      position: 2,
    },
  },
};

const lists: Record<string, WorkTask> = {
  [labelledList.id]: labelledList,
  [unlabelledList.id]: unlabelledList,
};

const mockLabels: StoredLabel[] = [a11yLabel, urgentLabel];

const noop = () => <></>;

function renderTaskList(
  listId: string,
  storageContext: WorkStorageContextType,
) {
  return render(
    <WorkStorageContext.Provider value={storageContext}>
      <TaskList
        listId={listId}
        index={0}
        parentListId="work"
        additionalMoveDestinations={noop}
      />
    </WorkStorageContext.Provider>,
  );
}

function createStorageContext(): WorkStorageContextType {
  return createWorkStorageContext({
    lists,
    getList: (listId) => lists[listId],
    getTask: (listId, taskId) => lists[listId]?.items?.[taskId],
    labels: mockLabels,
    getLabel: (id) => mockLabels.find((l) => l.id === id),
  });
}

describe('TaskList label', () => {
  it('opens the label picker when the label text is clicked', async () => {
    const user = userEvent.setup();
    renderTaskList(labelledList.id, createStorageContext());

    const labelText = screen.getByRole('button', { name: 'Change a11y label' });
    expect(labelText).toHaveTextContent('a11y');

    await user.click(labelText);

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it("doesn't show a label or edit button when the list has none", () => {
    renderTaskList(unlabelledList.id, createStorageContext());

    expect(screen.queryByText('a11y')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Change .* label/ }),
    ).not.toBeInTheDocument();
  });

  it('removes the label when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const storageContext = createStorageContext();
    renderTaskList(labelledList.id, storageContext);

    const labelItem = screen.getByText('a11y').closest('li');
    await user.click(
      within(labelItem!).getByRole('button', { name: 'Remove a11y' }),
    );

    expect(storageContext.removeLabel).toHaveBeenCalledWith(
      a11yLabel.id,
      labelledList,
    );
  });

  it('switches to a different label when edited', async () => {
    const user = userEvent.setup();
    const storageContext = createStorageContext();
    renderTaskList(labelledList.id, storageContext);

    await user.click(screen.getByRole('button', { name: 'Change a11y label' }));
    await user.click(screen.getByRole('option', { name: 'urgent' }));

    expect(storageContext.changeLabels).toHaveBeenCalledWith(
      [{ value: urgentLabel.value, colour: urgentLabel.colour }],
      labelledList,
    );
    expect(storageContext.removeLabel).not.toHaveBeenCalled();
  });

  it('brings the edit button back when the label picker is dismissed', async () => {
    const user = userEvent.setup();
    renderTaskList(labelledList.id, createStorageContext());

    await user.click(screen.getByRole('button', { name: 'Change a11y label' }));
    expect(
      screen.queryByRole('button', { name: 'Change a11y label' }),
    ).not.toBeInTheDocument();

    await user.click(document.body);

    expect(
      screen.getByRole('button', { name: 'Change a11y label' }),
    ).toBeInTheDocument();
  });

  it('brings the edit button back when the label picker is cancelled with escape', async () => {
    const user = userEvent.setup();
    renderTaskList(labelledList.id, createStorageContext());

    await user.click(screen.getByRole('button', { name: 'Change a11y label' }));
    await user.keyboard('{Escape}');

    expect(
      screen.getByRole('button', { name: 'Change a11y label' }),
    ).toBeInTheDocument();
  });
});

describe('TaskList count', () => {
  it('shows the number of not-done items in the list', () => {
    renderTaskList(unlabelledList.id, createStorageContext());

    expect(screen.getByLabelText('2 tasks remaining')).toHaveTextContent('(2)');
  });

  it('hides the count for a list with no items', () => {
    renderTaskList(labelledList.id, createStorageContext());

    expect(screen.queryByLabelText(/tasks remaining/)).not.toBeInTheDocument();
  });
});

describe('TaskList focus', () => {
  function renderStoredTaskList(list: WorkTask) {
    const firebaseContext = createMockFirebaseContext({
      work: { [list.id]: list },
    });
    render(
      <FirebaseContext.Provider value={firebaseContext}>
        <WorkStorageProvider>
          <TaskList
            listId={list.id}
            index={0}
            parentListId="work"
            additionalMoveDestinations={noop}
          />
        </WorkStorageProvider>
      </FirebaseContext.Provider>,
    );
  }

  async function deleteTaskDescription(
    user: ReturnType<typeof userEvent.setup>,
    description: string,
  ) {
    await user.click(
      screen.getByRole('button', { name: `Edit description ${description}` }),
    );
    await user.clear(
      screen.getByRole('textbox', { name: `Edit description ${description}` }),
    );
    await user.keyboard('{Enter}');
  }

  describe('when a task is added', () => {
    it('moves focus to the new task', async () => {
      const user = userEvent.setup();
      renderStoredTaskList(unlabelledList);

      await user.click(screen.getByRole('list'));
      await user.type(
        screen.getByRole('textbox', { name: 'Description' }),
        'write tests{Enter}',
      );

      expect(
        screen.getByRole('button', { name: 'Edit description write tests' }),
      ).toHaveFocus();
    });
  });

  describe('when the add task form is cancelled', () => {
    describe('and the list has tasks', () => {
      it('moves focus to the last task', async () => {
        const user = userEvent.setup();
        renderStoredTaskList(unlabelledList);

        await user.click(screen.getByRole('list'));
        await user.keyboard('{Escape}');

        expect(
          screen.getByRole('button', { name: 'Edit description done' }),
        ).toHaveFocus();
      });
    });

    describe('and the list is empty', () => {
      it('moves focus to the list heading', async () => {
        const user = userEvent.setup();
        renderStoredTaskList(labelledList);

        await user.click(screen.getByRole('list'));
        await user.keyboard('{Escape}');

        expect(screen.getByRole('heading', { level: 2 })).toHaveFocus();
      });
    });
  });

  describe('when a task is deleted', () => {
    describe('and there is a task before it', () => {
      it('moves focus to the previous task', async () => {
        const user = userEvent.setup();
        renderStoredTaskList(unlabelledList);

        const deletedTask = screen.getByRole('button', {
          name: 'Edit description also not done',
        });
        await deleteTaskDescription(user, 'also not done');

        expect(deletedTask).not.toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'Edit description not done' }),
        ).toHaveFocus();
      });
    });

    describe('and it is the first task', () => {
      it('moves focus to the list heading', async () => {
        const user = userEvent.setup();
        renderStoredTaskList(unlabelledList);

        const deletedTask = screen.getByRole('button', {
          name: 'Edit description not done',
        });
        await deleteTaskDescription(user, 'not done');

        expect(deletedTask).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2 })).toHaveFocus();
      });
    });
  });
});
