import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';
import {
  WorkStorageContext,
  WorkStorageContextType,
  WorkStorageProvider,
} from './WorkStorageContext';
import { FirebaseContext } from 'shared/FirebaseContext';
import { createMockFirebaseContext } from 'shared/mockFirebase';
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
      position: 3,
    },
    'task-4': {
      id: 'task-4',
      description: 'blocked',
      status: 'not_started',
      parentId: 'list-2',
      lastStatusUpdate: '2026-01-01',
      position: 2,
      blockedOn: 'build',
    },
  },
};

const featureGateList: WorkTask = {
  id: 'list-3',
  description: 'Feature gates',
  status: 'not_started',
  parentId: 'work',
  lastStatusUpdate: '2026-01-01',
  position: 2,
  items: {
    'gate-1': {
      id: 'gate-1',
      description: 'new-checkout-2 [0930]',
      status: 'not_started',
      parentId: 'list-3',
      lastStatusUpdate: '2026-01-01',
      position: 0,
    },
    'gate-2': {
      id: 'gate-2',
      description: 'Turn on new checkout',
      status: 'not_started',
      parentId: 'list-3',
      lastStatusUpdate: '2026-01-01',
      position: 1,
    },
    'gate-3': {
      id: 'gate-3',
      description: 'checkout',
      status: 'not_started',
      parentId: 'list-3',
      lastStatusUpdate: '2026-01-01',
      position: 2,
    },
  },
};

const createDependencyTask = (
  id: string,
  description: string,
  position: number,
  overrides: Partial<WorkTask> = {},
): WorkTask => ({
  id,
  description,
  status: 'not_started',
  parentId: 'list-4',
  lastStatusUpdate: '2026-01-01',
  position,
  ...overrides,
});

const dependencyList: WorkTask = {
  id: 'list-4',
  description: 'Rollout',
  status: 'not_started',
  parentId: 'work',
  lastStatusUpdate: '2026-01-01',
  position: 3,
  items: {
    'merge-it': createDependencyTask('merge-it', 'merge it', 0, {
      blockedOn: 'merge_queue',
    }),
    'deploy-it': createDependencyTask('deploy-it', '^^ deploy it', 1, {
      blockedOn: 'human',
    }),
    'announce-it': createDependencyTask('announce-it', '^^ announce it', 2),
    'tidy-up': createDependencyTask('tidy-up', 'tidy up', 3),
  },
};

const lists: Record<string, WorkTask> = {
  [labelledList.id]: labelledList,
  [unlabelledList.id]: unlabelledList,
  [featureGateList.id]: featureGateList,
  [dependencyList.id]: dependencyList,
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

    await user.click(screen.getByRole('button', { name: 'Remove a11y' }));

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

    const editButton = screen.getByRole('button', {
      name: 'Change a11y label',
    });
    await user.click(editButton);
    expect(editButton).not.toBeInTheDocument();

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
  it('shows the number of tasks that are neither done nor blocked, out of all tasks that are not done', () => {
    renderTaskList(unlabelledList.id, createStorageContext());

    expect(screen.getByLabelText('2 of 3 tasks remaining')).toHaveTextContent(
      '(2/3)',
    );
  });

  it('hides the count for a list with no items', () => {
    renderTaskList(labelledList.id, createStorageContext());

    expect(screen.queryByLabelText(/tasks remaining/)).not.toBeInTheDocument();
  });
});

describe('TaskList dependent tasks', () => {
  const getTaskItem = (description: string) =>
    within(screen.getByText(description).closest('li')!);

  const getBlockerButton = (description: string) =>
    getTaskItem(description).getByRole('button', {
      name: /^(Blocked on|Mark as blocked)/,
    });

  describe('a task starting with ^^', () => {
    it('shows the blocker of the task above it', () => {
      renderTaskList(dependencyList.id, createStorageContext());

      expect(getBlockerButton('^^ deploy it')).toHaveAccessibleName(
        'Blocked on merge queue',
      );
    });

    it('is styled as dependent', () => {
      renderTaskList(dependencyList.id, createStorageContext());

      expect(screen.getByText('^^ deploy it').closest('li')).toHaveClass(
        'dependent',
      );
    });

    describe('below another task starting with ^^', () => {
      it('shows the blocker of the first task above them without ^^', () => {
        renderTaskList(dependencyList.id, createStorageContext());

        expect(getBlockerButton('^^ announce it')).toHaveAccessibleName(
          'Blocked on merge queue',
        );
      });
    });

    describe('when its blocker is changed', () => {
      it('changes the blocker of the task it depends on', async () => {
        const user = userEvent.setup();
        const storageContext = createStorageContext();
        renderTaskList(dependencyList.id, storageContext);

        await user.click(getBlockerButton('^^ announce it'));
        await user.click(
          getTaskItem('^^ announce it').getByRole('button', {
            name: 'Blocked on time',
            hidden: true,
          }),
        );

        expect(storageContext.updateTask).toHaveBeenCalledWith(
          dependencyList.id,
          expect.objectContaining({ id: 'merge-it', blockedOn: 'time' }),
        );
      });
    });

    describe('when it is unblocked', () => {
      it('unblocks the task it depends on', async () => {
        const user = userEvent.setup();
        const storageContext = createStorageContext();
        renderTaskList(dependencyList.id, storageContext);

        await user.click(getBlockerButton('^^ deploy it'));
        await user.click(
          getTaskItem('^^ deploy it').getByRole('button', {
            name: 'Unblock',
            hidden: true,
          }),
        );

        const [, updatedTask] = jest.mocked(storageContext.updateTask).mock
          .calls[0];
        expect(updatedTask.id).toBe('merge-it');
        expect(updatedTask).not.toHaveProperty('blockedOn');
      });
    });
  });

  describe('a task without ^^', () => {
    it('keeps its own blocker', () => {
      renderTaskList(dependencyList.id, createStorageContext());

      expect(getBlockerButton('tidy up')).toHaveAccessibleName(
        'Mark as blocked',
      );
    });
  });

  describe('when a task is moved with the keyboard', () => {
    const moveTask = async (description: string, key: string) => {
      const user = userEvent.setup();
      const storageContext = createStorageContext();
      renderTaskList(dependencyList.id, storageContext);

      getTaskItem(description)
        .getByRole('button', { name: 'drag menu' })
        .focus();
      await user.keyboard(key);

      const [, reorderedTasks] = jest.mocked(storageContext.reorderTasks).mock
        .calls[0];
      return reorderedTasks.map(({ id }) => id);
    };

    describe('and it has dependent tasks', () => {
      it('moves its dependent tasks along with it', async () => {
        expect(await moveTask('merge it', '{ArrowDown}')).toEqual([
          'tidy-up',
          'merge-it',
          'deploy-it',
          'announce-it',
        ]);
      });
    });

    describe('past a task with dependent tasks', () => {
      it('moves past those dependent tasks too', async () => {
        expect(await moveTask('tidy up', '{ArrowUp}')).toEqual([
          'tidy-up',
          'merge-it',
          'deploy-it',
          'announce-it',
        ]);
      });
    });

    describe('and it is a dependent task', () => {
      it('moves only that task', async () => {
        expect(await moveTask('^^ announce it', '{ArrowUp}')).toEqual([
          'merge-it',
          'announce-it',
          'deploy-it',
          'tidy-up',
        ]);
      });
    });
  });

  it('counts dependent tasks as blocked when the task they depend on is', () => {
    renderTaskList(dependencyList.id, createStorageContext());

    expect(screen.getByLabelText('1 of 4 tasks remaining')).toBeInTheDocument();
  });
});

describe('TaskList task actions', () => {
  describe('when a task is named like a feature gate', () => {
    it('copies the feature gate name, without its timestamp', async () => {
      const user = userEvent.setup();
      renderTaskList(featureGateList.id, createStorageContext());

      await user.click(
        screen.getByRole('button', { name: 'Copy new-checkout-2' }),
      );

      expect(await navigator.clipboard.readText()).toBe('new-checkout-2');
    });
  });

  describe('when a task is not named like a feature gate', () => {
    it.each(['Turn on new checkout', 'checkout'])(
      'offers to add subtasks to "%s"',
      (description) => {
        renderTaskList(featureGateList.id, createStorageContext());

        const task = screen.getByText(description).closest('li')!;
        expect(
          within(task).getByRole('button', { name: 'Add subtask' }),
        ).toBeInTheDocument();
      },
    );
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
