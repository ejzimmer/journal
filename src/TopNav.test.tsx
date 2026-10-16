import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TopNav } from './TopNav';

const TAB_WIDTH = 100;

class ImmediateResizeObserver {
  constructor(private callback: ResizeObserverCallback) {}
  observe() {
    this.callback([], this as unknown as ResizeObserver);
  }
  unobserve() {}
  disconnect() {}
}

function renderTopNav({
  barWidth,
  path = '/todo',
}: {
  barWidth: number;
  path?: string;
}) {
  Object.defineProperty(HTMLUListElement.prototype, 'clientWidth', {
    configurable: true,
    get: () => barWidth,
  });

  render(
    <MemoryRouter initialEntries={[path]}>
      <TopNav />
    </MemoryRouter>,
  );
}

function getTabNames() {
  return within(screen.getByRole('navigation'))
    .getAllByRole('link')
    .map((link) => link.textContent);
}

describe('TopNav', () => {
  beforeEach(() => {
    globalThis.ResizeObserver =
      ImmediateResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    delete (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
    delete (HTMLUListElement.prototype as { clientWidth?: number }).clientWidth;
  });

  describe('when every tab fits', () => {
    it('shows every tab in the bar', () => {
      renderTopNav({ barWidth: TAB_WIDTH * 6 });

      expect(getTabNames()).toEqual([
        'todo',
        'health',
        '2026',
        'projects',
        'media',
        'work',
      ]);
    });
  });

  describe("when the tabs don't all fit", () => {
    const barWidth = TAB_WIDTH * 3.5;

    it('shows as many tabs as fit beside the menu', () => {
      renderTopNav({ barWidth });

      expect(getTabNames()).toEqual(['todo', 'health']);
    });

    it('lists the rest in the more tabs menu', async () => {
      renderTopNav({ barWidth });

      await userEvent.click(screen.getByRole('button', { name: 'More tabs' }));

      expect(
        screen.getAllByRole('menuitem').map((item) => item.textContent),
      ).toEqual(['2026', 'projects', 'media', 'work']);
    });

    describe('and a tab in the menu is chosen', () => {
      it('goes to that tab and closes the menu', async () => {
        renderTopNav({ barWidth });
        await userEvent.click(
          screen.getByRole('button', { name: 'More tabs' }),
        );
        const media = screen.getByRole('menuitem', { name: 'media' });

        await userEvent.click(media);

        expect(media).toHaveAttribute('aria-current', 'page');
        expect(media).not.toBeVisible();
      });
    });

    describe('and the current tab is in the menu', () => {
      it('marks the menu button as active', () => {
        renderTopNav({ barWidth, path: '/work' });

        expect(screen.getByRole('button', { name: 'More tabs' })).toHaveClass(
          'active',
        );
      });
    });
  });
});
