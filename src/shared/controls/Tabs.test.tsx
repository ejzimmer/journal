import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs } from './Tabs';

const TABS = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two' },
  { id: 'three', label: 'Three' },
];

function renderTabs(selectedTab: string, tabs = TABS) {
  const onSelectTab = jest.fn();
  const view = render(
    <Tabs
      tabs={tabs}
      selectedTab={selectedTab}
      onSelectTab={onSelectTab}
      label="Numbers"
    >
      Panel content
    </Tabs>,
  );
  return { ...view, onSelectTab };
}

describe('Tabs', () => {
  describe('with several tabs', () => {
    it('marks the selected tab as selected', () => {
      renderTabs('two');

      expect(screen.getByRole('tab', { name: 'Two' })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      expect(screen.getByRole('tab', { name: 'One' })).toHaveAttribute(
        'aria-selected',
        'false',
      );
    });

    it('labels the panel with the selected tab', () => {
      renderTabs('two');

      expect(screen.getByRole('tabpanel', { name: 'Two' })).toHaveTextContent(
        'Panel content',
      );
    });

    describe('clicking a tab', () => {
      it('selects it', async () => {
        const { onSelectTab } = renderTabs('one');

        await userEvent.click(screen.getByRole('tab', { name: 'Three' }));

        expect(onSelectTab).toHaveBeenCalledWith('three');
      });
    });

    describe('using the keyboard', () => {
      it.each([
        ['{ArrowRight}', 'two', 'three'],
        ['{ArrowLeft}', 'two', 'one'],
        ['{ArrowRight}', 'three', 'one'],
        ['{ArrowLeft}', 'one', 'three'],
        ['{Home}', 'three', 'one'],
        ['{End}', 'one', 'three'],
      ])('%s from %s selects and focuses %s', async (key, from, to) => {
        const { onSelectTab } = renderTabs(from);
        const target = screen.getByRole('tab', {
          name: TABS.find(({ id }) => id === to)?.label,
        });

        screen.getByRole('tab', { selected: true }).focus();
        await userEvent.keyboard(key);

        expect(onSelectTab).toHaveBeenCalledWith(to);
        expect(target).toHaveFocus();
      });
    });
  });

  describe('when it drops to a single tab', () => {
    it('shows the content without a tab list', () => {
      const { rerender } = renderTabs('one');
      const tabList = screen.getByRole('tablist', { name: 'Numbers' });

      rerender(
        <Tabs
          tabs={TABS.slice(0, 1)}
          selectedTab="one"
          onSelectTab={jest.fn()}
          label="Numbers"
        >
          Panel content
        </Tabs>,
      );

      expect(tabList).not.toBeInTheDocument();
      expect(screen.getByText('Panel content')).toBeInTheDocument();
    });
  });
});
