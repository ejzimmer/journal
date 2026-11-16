import { act, screen, within } from '@testing-library/react';

import { findCard, renderHomePage } from './homePageTestUtils';

const seed = {
  projects: {
    blanket: { id: 'blanket', name: 'Blanket', type: 'blanket' },
    sleeve: { id: 'sleeve', name: 'Laptop sleeve', type: 'accessory' },
    cardigan: { id: 'cardigan', name: 'Cardigan', type: 'cardigan' },
    socks: { id: 'socks', name: 'Socks for Dad', type: 'socks' },
  },
  lists: {
    portable: {
      sleeve: { id: 'sleeve', position: 2 },
      blanket: { id: 'blanket', position: 1 },
    },
    priority: { cardigan: { id: 'cardigan', position: 1 } },
    future: { socks: { id: 'socks', position: 1 } },
  },
};

const finishingSeed = {
  projects: {
    cardigan: { id: 'cardigan', name: 'Cardigan', type: 'cardigan' },
    scarf: { id: 'scarf', name: 'Scarf', type: 'accessory' },
    socks: { id: 'socks', name: 'Socks for Dad', type: 'socks' },
    hat: {
      id: 'hat',
      name: 'Hat',
      type: 'hat',
      subtasks: {
        brim: { id: 'brim', description: 'Brim', status: 'done', position: 1 },
        crown: {
          id: 'crown',
          description: 'Crown',
          status: 'ready',
          position: 2,
        },
      },
    },
    mittens: {
      id: 'mittens',
      name: 'Mittens',
      type: 'accessory',
      subtasks: {
        thumbs: {
          id: 'thumbs',
          description: 'Thumbs',
          status: 'done',
          position: 1,
        },
      },
    },
    bonnet: {
      id: 'bonnet',
      name: 'Bonnet',
      type: 'hat',
      subtasks: {
        ties: { id: 'ties', description: 'Ties', status: 'done', position: 1 },
      },
    },
    booties: {
      id: 'booties',
      name: 'Booties',
      type: 'socks',
      subtasks: {
        soles: {
          id: 'soles',
          description: 'Soles',
          status: 'done',
          position: 1,
        },
      },
    },
  },
  lists: {
    priority: {
      cardigan: { id: 'cardigan', position: 1 },
      mittens: { id: 'mittens', position: 2 },
    },
    portable: {
      hat: { id: 'hat', position: 2 },
      scarf: { id: 'scarf', position: 3 },
    },
    future: { socks: { id: 'socks', position: 1 } },
    done: {
      bonnet: {
        id: 'bonnet',
        position: 1,
        previous: { list: 'portable', position: 1 },
      },
      booties: { id: 'booties', position: 2 },
    },
  },
};

function findProjectNamesIn(listName: string) {
  const list = screen.getByRole('list', { name: listName });
  return within(list)
    .getAllByRole('listitem')
    .filter((card) => card.parentElement === list)
    .map((card) => card.querySelector('.project-name')?.textContent);
}

async function toggleSubtask(
  user: ReturnType<typeof renderHomePage>['user'],
  projectName: string,
  subtaskName: string,
) {
  const card = within(findCard(projectName));
  await user.click(card.getByRole('button', { name: 'Expand project' }));
  await user.click(card.getByRole('checkbox', { name: subtaskName }));
}

function showPageAgain() {
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
}

async function moveProject(
  user: ReturnType<typeof renderHomePage>['user'],
  projectName: string,
  listName: string,
) {
  const card = within(findCard(projectName));
  await user.click(card.getByRole('button', { name: 'Move to another list' }));
  await user.click(card.getByRole('button', { name: `Move to ${listName}` }));
}

describe('HomePage', () => {
  describe('showing the lists', () => {
    it('shows each list in position order', () => {
      renderHomePage(seed);

      expect(findProjectNamesIn('Portable')).toEqual([
        'Blanket',
        'Laptop sleeve',
      ]);
      expect(findProjectNamesIn('Priority')).toEqual(['Cardigan']);
      expect(findProjectNamesIn('Future')).toEqual(['Socks for Dad']);
    });

    it('labels each card with its project type', () => {
      renderHomePage(seed);

      expect(
        within(findCard('Laptop sleeve')).getByRole('img', {
          name: 'Accessory',
        }),
      ).toBeInTheDocument();
    });
  });

  describe('moving a project', () => {
    describe('from the future list into a queue', () => {
      it('puts it at the bottom of the queue', async () => {
        const { user } = renderHomePage(seed);
        const card = within(findCard('Socks for Dad'));

        await user.click(
          card.getByRole('button', { name: 'Move to another list' }),
        );
        await user.click(
          card.getByRole('button', { name: 'Move to Priority' }),
        );

        expect(findProjectNamesIn('Priority')).toEqual([
          'Cardigan',
          'Socks for Dad',
        ]);
      });
    });

    describe('between the portable and priority queues', () => {
      describe('from portable to priority', () => {
        it('puts it at the top of priority', async () => {
          const { user } = renderHomePage(seed);

          await moveProject(user, 'Laptop sleeve', 'Priority');

          expect(findProjectNamesIn('Priority')).toEqual([
            'Laptop sleeve',
            'Cardigan',
          ]);
          expect(findProjectNamesIn('Portable')).toEqual(['Blanket']);
        });
      });

      describe('from priority to portable', () => {
        describe('when it came from portable', () => {
          it('puts it back where it was', async () => {
            const { user } = renderHomePage(seed);
            await moveProject(user, 'Laptop sleeve', 'Priority');

            await moveProject(user, 'Laptop sleeve', 'Portable');

            expect(findProjectNamesIn('Portable')).toEqual([
              'Blanket',
              'Laptop sleeve',
            ]);
          });
        });

        describe('when it came from somewhere else', () => {
          it('puts it at the top of portable', async () => {
            const { user } = renderHomePage(seed);

            await moveProject(user, 'Cardigan', 'Portable');

            expect(findProjectNamesIn('Portable')).toEqual([
              'Cardigan',
              'Blanket',
              'Laptop sleeve',
            ]);
          });
        });
      });
    });

    describe('within its own queue', () => {
      it('puts it at the top of the queue', async () => {
        const { user } = renderHomePage(seed);

        await moveProject(user, 'Laptop sleeve', 'top of Portable');

        expect(findProjectNamesIn('Portable')).toEqual([
          'Laptop sleeve',
          'Blanket',
        ]);
      });

      describe('in priority after coming from portable', () => {
        it('still goes back to its old spot when moved to portable', async () => {
          const { user } = renderHomePage(seed);
          await moveProject(user, 'Laptop sleeve', 'Priority');
          await moveProject(user, 'Cardigan', 'top of Priority');
          await moveProject(user, 'Laptop sleeve', 'top of Priority');

          await moveProject(user, 'Laptop sleeve', 'Portable');

          expect(findProjectNamesIn('Portable')).toEqual([
            'Blanket',
            'Laptop sleeve',
          ]);
        });
      });
    });

    describe('from a queue to the future list', () => {
      it('puts it at the end of the future list', async () => {
        const { user } = renderHomePage(seed);
        const card = within(findCard('Cardigan'));

        await user.click(
          card.getByRole('button', { name: 'Move to another list' }),
        );
        await user.click(card.getByRole('button', { name: 'Move to Future' }));

        expect(findProjectNamesIn('Future')).toEqual([
          'Socks for Dad',
          'Cardigan',
        ]);
      });

      describe('when it came from the future list', () => {
        it('still puts it at the end of the future list', async () => {
          const { user } = renderHomePage({
            projects: {
              ...seed.projects,
              tam: { id: 'tam', name: 'Tam', type: 'hat' },
            },
            lists: {
              ...seed.lists,
              future: {
                socks: { id: 'socks', position: 1 },
                tam: { id: 'tam', position: 2 },
              },
            },
          });
          await moveProject(user, 'Socks for Dad', 'Priority');

          await moveProject(user, 'Socks for Dad', 'Future');

          expect(findProjectNamesIn('Future')).toEqual([
            'Tam',
            'Socks for Dad',
          ]);
        });
      });
    });

    describe('when the menu is open', () => {
      it('shows the current list as unavailable', async () => {
        const { user } = renderHomePage(seed);
        const card = within(findCard('Socks for Dad'));

        await user.click(
          card.getByRole('button', { name: 'Move to another list' }),
        );

        expect(
          card.getByRole('button', { name: 'Future (current list)' }),
        ).toBeDisabled();
      });
    });
  });

  describe('finishing a project', () => {
    describe('when its last subtask is ticked', () => {
      it('keeps it in its list until the page is shown again', async () => {
        const { user } = renderHomePage(finishingSeed);

        await toggleSubtask(user, 'Hat', 'Crown');

        expect(findProjectNamesIn('Portable')).toEqual(['Hat', 'Scarf']);
      });

      it('moves it to the end of the done list when the page is shown again', async () => {
        const { user } = renderHomePage(finishingSeed);
        await toggleSubtask(user, 'Hat', 'Crown');

        showPageAgain();

        expect(findProjectNamesIn('Portable')).toEqual(['Scarf']);
        expect(findProjectNamesIn('Done')).toEqual([
          'Bonnet',
          'Booties',
          'Mittens',
          'Hat',
        ]);
      });
    });

    describe('when the page loads with a finished project in a list', () => {
      it('moves it to the done list', () => {
        renderHomePage(finishingSeed);

        expect(findProjectNamesIn('Priority')).toEqual(['Cardigan']);
        expect(findProjectNamesIn('Done')).toEqual([
          'Bonnet',
          'Booties',
          'Mittens',
        ]);
      });
    });

    describe('when a project has no subtasks', () => {
      it('leaves it in its list', () => {
        renderHomePage(finishingSeed);

        showPageAgain();

        expect(findProjectNamesIn('Portable')).toEqual(['Hat', 'Scarf']);
      });
    });
  });

  describe('a done project', () => {
    it('can be expanded but not moved', () => {
      renderHomePage(finishingSeed);
      const cardHeader = findCard('Bonnet').querySelector<HTMLElement>(
        '.project-card-header',
      );

      expect(
        within(cardHeader!)
          .getAllByRole('button')
          .map((button) => button.getAttribute('aria-label')),
      ).toEqual(['Expand project']);
    });

    describe('when a subtask is unticked', () => {
      it('stays in the done list until the page is shown again', async () => {
        const { user } = renderHomePage(finishingSeed);

        await toggleSubtask(user, 'Bonnet', 'Ties');

        expect(findProjectNamesIn('Done')).toEqual([
          'Bonnet',
          'Booties',
          'Mittens',
        ]);
      });

      it('goes back where it was when the page is shown again', async () => {
        const { user } = renderHomePage(finishingSeed);
        await toggleSubtask(user, 'Bonnet', 'Ties');

        showPageAgain();

        expect(findProjectNamesIn('Portable')).toEqual([
          'Bonnet',
          'Hat',
          'Scarf',
        ]);
        expect(findProjectNamesIn('Done')).toEqual(['Booties', 'Mittens']);
      });
    });

    describe('when it has no saved spot', () => {
      it('goes to the end of the future list once unticked', async () => {
        const { user } = renderHomePage(finishingSeed);
        await toggleSubtask(user, 'Booties', 'Soles');

        showPageAgain();

        expect(findProjectNamesIn('Future')).toEqual([
          'Socks for Dad',
          'Booties',
        ]);
      });
    });
  });

  describe('adding a project', () => {
    describe('with a name', () => {
      it('adds it to the end of the future list with the chosen type', async () => {
        const { user } = renderHomePage(seed);

        await user.type(
          screen.getByRole('textbox', { name: 'New project' }),
          'Mittens',
        );
        await user.click(screen.getByRole('combobox', { name: 'Type' }));
        await user.click(screen.getByRole('option', { name: 'Accessory' }));
        await user.click(screen.getByRole('button', { name: 'Add project' }));

        expect(findProjectNamesIn('Future')).toEqual([
          'Socks for Dad',
          'Mittens',
        ]);
        expect(
          within(findCard('Mittens')).getByRole('img', { name: 'Accessory' }),
        ).toBeInTheDocument();
      });

      it('shows the chosen craft on the card', async () => {
        const { user } = renderHomePage(seed);

        await user.type(
          screen.getByRole('textbox', { name: 'New project' }),
          'Mittens',
        );
        await user.click(screen.getByRole('radio', { name: 'Crochet' }));
        await user.click(screen.getByRole('button', { name: 'Add project' }));

        expect(
          within(findCard('Mittens')).getByRole('img', { name: 'Crochet' }),
        ).toBeInTheDocument();
      });

      it('clears the name ready for the next project', async () => {
        const { user } = renderHomePage(seed);
        const nameInput = screen.getByRole('textbox', { name: 'New project' });

        await user.type(nameInput, 'Mittens{Enter}');

        expect(nameInput).toHaveValue('');
      });
    });

    describe('with only spaces for a name', () => {
      it('adds nothing', async () => {
        const { user } = renderHomePage(seed);

        const nameInput = screen.getByRole('textbox', { name: 'New project' });

        await user.type(nameInput, '   {Enter}');

        expect(nameInput).toBeInvalid();
        expect(findProjectNamesIn('Future')).toEqual(['Socks for Dad']);
      });
    });
  });

  describe('switching tabs', () => {
    it('shows the sock planner on the Socks tab', async () => {
      const { user } = renderHomePage(seed);

      await user.click(screen.getByRole('tab', { name: 'Socks' }));

      expect(
        screen.getByRole('region', { name: 'Sock planner' }),
      ).toBeInTheDocument();
    });
  });
});
