import { render, screen } from '@testing-library/react';
import { ComprehensionRecords } from './ComprehensionRecords';
import { PrintSeries } from './types';

const series: PrintSeries = {
  id: 'series',
  type: 'manga',
  name: 'Series',
  language: 'japanese',
  volumes: {
    vol1: {
      id: 'vol1',
      number: 1,
      lookups: 5,
      aiQuestions: 0,
      understood: 70,
      updates: {
        u1: {
          at: '2026-10-03T09:00:00Z',
          changes: { lookups: { from: 0, to: 5 }, understood: { to: 70 } },
        },
      },
    },
  },
};

describe('ComprehensionRecords', () => {
  it("shows each day's lookups and comprehension", () => {
    render(<ComprehensionRecords series={series} />);

    expect(
      screen.getByText('03 Oct: 5 looked up, 70% understood'),
    ).toBeInTheDocument();
  });
});
