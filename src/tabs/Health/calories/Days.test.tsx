import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Days } from './Days';
import { Balance } from '../utils';

const firstDay = Temporal.PlainDate.from('2026-01-01');
const mockDays: Balance[] = Array.from({ length: 20 }).map((_, index) => {
  const thisDay = firstDay.add({ days: index });
  return {
    id: thisDay.toString(),
    day: thisDay.day,
    month: 'Jan',
    monthNumber: thisDay.month,
    year: thisDay.year,
    dayOfWeek: thisDay.dayOfWeek,
  };
});

describe('Days', () => {
  it('shows a circle for every day so far this year except today, starting on the correct day', () => {
    render(<Days days={mockDays} onSelectDay={jest.fn()} />);

    expect(screen.getAllByRole('listitem')).toHaveLength(20);

    // 1 Jan 2026 is a Thursday
    expect(screen.getByRole('list', { name: 'by day' })).toHaveStyle({
      '--starting-index': '4',
    });
  });

  it("calls onSelectDay with the day's id when a dot is clicked", async () => {
    const user = userEvent.setup();
    const onSelectDay = jest.fn();
    render(<Days days={mockDays} onSelectDay={onSelectDay} />);

    const dots = screen.getAllByRole('button', { name: /^update / });
    expect(dots).toHaveLength(20);

    await user.click(screen.getByRole('button', { name: 'update 5 Jan' }));

    expect(onSelectDay).toHaveBeenCalledWith('2026-01-05');
  });

  describe('symptom icons', () => {
    describe('given a day with symptoms logged at different levels', () => {
      it('shows an icon for each symptom and its level', () => {
        const days: Balance[] = mockDays.map((day) =>
          day.day === 5 ? { ...day, trackers: ['flow-3', 'headache-1'] } : day,
        );
        render(<Days days={days} onSelectDay={jest.fn()} />);

        expect(
          screen.getByRole('img', { name: 'period flow 3' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('img', { name: 'headache 1' }),
        ).toBeInTheDocument();
      });
    });

    describe('given a day logged with the old period trackers', () => {
      it('shows them as period flow and period pain levels', () => {
        const days: Balance[] = mockDays.map((day) =>
          day.day === 5 ? { ...day, trackers: ['🔴', '🥚'] } : day,
        );
        render(<Days days={days} onSelectDay={jest.fn()} />);

        expect(
          screen.getByRole('img', { name: 'period flow 2' }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('img', { name: 'period pain 2' }),
        ).toBeInTheDocument();
      });
    });

    describe('given five symptoms on one day', () => {
      it('shows all of them', () => {
        const days: Balance[] = mockDays.map((day) =>
          day.day === 5
            ? {
                ...day,
                trackers: [
                  'flow-1',
                  'pain-1',
                  'tummy-1',
                  'headache-1',
                  'tired-1',
                ],
              }
            : day,
        );
        render(<Days days={days} onSelectDay={jest.fn()} />);

        expect(
          screen
            .getAllByRole('img')
            .map((icon) => icon.getAttribute('aria-label')),
        ).toEqual([
          'period flow 1',
          'period pain 1',
          'sore tummy 1',
          'headache 1',
          'tired 1',
        ]);
      });
    });
  });

  describe('dot colours', () => {
    const renderDiffs = (diffs: number[]) => {
      const days = mockDays
        .slice(0, diffs.length)
        .map((day, index) => ({ ...day, diff: diffs[index] }));
      render(<Days days={days} onSelectDay={jest.fn()} />);
      return screen.getAllByRole('listitem');
    };

    describe('on a deficit day', () => {
      it('shows 370 or more as the darkest green', () => {
        const [at, beyond] = renderDiffs([370, 900]);
        expect(at).toHaveStyle({ '--day-colour': 'lch(78% 230 104)' });
        expect(beyond).toHaveStyle({ '--day-colour': 'lch(78% 230 104)' });
      });

      it('scales lighter deficits against 370', () => {
        const [half] = renderDiffs([185, 900]);
        expect(half).toHaveStyle({ '--day-colour': 'lch(89% 115 104)' });
      });
    });

    describe('on a surplus day', () => {
      it('scales against the largest difference shown', () => {
        const [half] = renderDiffs([-450, 900]);
        expect(half).toHaveStyle({ '--day-colour': 'lch(89% 115 77)' });
      });
    });
  });
});
