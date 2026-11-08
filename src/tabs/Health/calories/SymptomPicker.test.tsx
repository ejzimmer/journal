import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { SymptomPicker } from './SymptomPicker';

function StatefulPicker({ initial = [] }: { initial?: string[] }) {
  const [trackers, setTrackers] = useState(initial);
  return (
    <>
      <input aria-label="before" />
      <SymptomPicker trackers={trackers} onChange={setTrackers} />
      <input aria-label="after" />
      <output aria-label="trackers">{trackers.join(',')}</output>
    </>
  );
}

function renderPicker(initial?: string[]) {
  const user = userEvent.setup();
  render(<StatefulPicker initial={initial} />);
  const picker = screen.getByRole('combobox', { name: 'symptoms' });
  return { user, picker };
}

function activeCellName(picker: HTMLElement) {
  const id = picker.getAttribute('aria-activedescendant');
  return id && document.getElementById(id)?.getAttribute('aria-label');
}

function trackers() {
  return screen.getByRole('status', { name: 'trackers' }).textContent;
}

describe('SymptomPicker', () => {
  describe('tabbing through the form', () => {
    it('stops on the picker once, then moves to the next field', async () => {
      const { user, picker } = renderPicker();

      await user.click(screen.getByRole('textbox', { name: 'before' }));
      await user.tab();
      expect(picker).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('textbox', { name: 'after' })).toHaveFocus();
    });

    describe('when the picker is open', () => {
      it('closes it and moves to the next field', async () => {
        const { user, picker } = renderPicker();
        picker.focus();
        await user.keyboard('{ArrowDown}');

        await user.tab();

        expect(picker).toHaveAttribute('aria-expanded', 'false');
        expect(screen.getByRole('textbox', { name: 'after' })).toHaveFocus();
      });
    });
  });

  describe('opening the picker', () => {
    describe('when nothing is logged', () => {
      it('starts on the first level of the first symptom', async () => {
        const { user, picker } = renderPicker();
        picker.focus();

        await user.keyboard('{ArrowDown}');

        expect(picker).toHaveAttribute('aria-expanded', 'true');
        expect(activeCellName(picker)).toBe('headache 1');
      });
    });

    describe('when a symptom is logged', () => {
      it('starts on the logged level', async () => {
        const { user, picker } = renderPicker(['gas-2']);
        picker.focus();

        await user.keyboard(' ');

        expect(activeCellName(picker)).toBe('gas 2');
      });
    });
  });

  describe('when the picker is open', () => {
    const openPicker = async (initial?: string[]) => {
      const { user, picker } = renderPicker(initial);
      picker.focus();
      await user.keyboard('{ArrowDown}');
      return { user, picker };
    };

    describe('the arrow keys', () => {
      it('move between symptoms with up and down', async () => {
        const { user, picker } = await openPicker();

        await user.keyboard('{ArrowDown}{ArrowDown}');
        expect(activeCellName(picker)).toBe('cramps 1');

        await user.keyboard('{ArrowUp}');
        expect(activeCellName(picker)).toBe('period flow 1');
      });

      it('move between levels with left and right', async () => {
        const { user, picker } = await openPicker();

        await user.keyboard('{ArrowRight}{ArrowRight}');
        expect(activeCellName(picker)).toBe('headache 3');

        await user.keyboard('{ArrowLeft}');
        expect(activeCellName(picker)).toBe('headache 2');
      });

      it('stop at the edges of the grid', async () => {
        const { user, picker } = await openPicker();

        await user.keyboard('{ArrowUp}{ArrowLeft}');

        expect(activeCellName(picker)).toBe('headache 1');
      });

      describe('moving to another symptom', () => {
        it("shows that symptom's name instead", async () => {
          const { user } = await openPicker();
          const headache = screen.getByText('headache');
          expect(headache).toBeVisible();

          await user.keyboard('{ArrowDown}');

          expect(screen.getByText('period flow')).toBeVisible();
          expect(headache).not.toBeVisible();
        });
      });
    });

    describe('pressing space', () => {
      it('selects the current level', async () => {
        const { user } = await openPicker();

        await user.keyboard('{ArrowRight} ');

        expect(
          screen.getByRole('gridcell', { name: 'headache 2' }),
        ).toHaveAttribute('aria-selected', 'true');
        expect(trackers()).toBe('headache-2');
      });

      describe('on the level that is already selected', () => {
        it('deselects the symptom', async () => {
          const { user } = await openPicker(['headache-1', 'gas-3']);

          await user.keyboard(' ');

          expect(trackers()).toBe('gas-3');
        });
      });

      describe('on another level of a selected symptom', () => {
        it('replaces the level', async () => {
          const { user } = await openPicker(['headache-1']);

          await user.keyboard('{ArrowRight}{ArrowRight} ');

          expect(trackers()).toBe('headache-3');
        });
      });
    });

    describe('pressing enter', () => {
      it('closes the picker, keeping the selected symptoms', async () => {
        const { user, picker } = await openPicker();
        await user.keyboard(' ');

        await user.keyboard('{Enter}');

        expect(picker).toHaveAttribute('aria-expanded', 'false');
        expect(picker).toHaveFocus();
        expect(trackers()).toBe('headache-1');
      });
    });

    describe('pressing escape', () => {
      it('closes the picker', async () => {
        const { user, picker } = await openPicker();

        await user.keyboard('{Escape}');

        expect(picker).toHaveAttribute('aria-expanded', 'false');
      });
    });

    describe('clicking a level', () => {
      it('selects it and keeps the picker open', async () => {
        const { user, picker } = await openPicker();

        await user.click(screen.getByRole('gridcell', { name: 'cough 3' }));

        expect(trackers()).toBe('cough-3');
        expect(picker).toHaveAttribute('aria-expanded', 'true');
        expect(activeCellName(picker)).toBe('cough 3');
      });
    });
  });

  describe('when the picker is opened with the mouse', () => {
    describe('hovering a level', () => {
      it("shows the symptom's name", async () => {
        const { user, picker } = renderPicker();
        await user.click(picker);

        await user.hover(
          screen.getByRole('gridcell', { name: 'sore throat 2' }),
        );

        expect(screen.getByRole('tooltip')).toHaveTextContent('sore throat');
      });
    });
  });
});
