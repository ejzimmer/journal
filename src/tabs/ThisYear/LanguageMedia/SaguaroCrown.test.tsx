import { render, screen } from '@testing-library/react';
import { SaguaroCrown } from './SaguaroCrown';

const renderCrown = (understood: number) =>
  render(
    <svg>
      <SaguaroCrown
        spot={{ key: 'v1-crown', x: 0, y: 0, angle: -90, understood }}
      />
    </svg>,
  );

describe('SaguaroCrown', () => {
  describe('at 90% understood', () => {
    it('opens 11 of the 20 buds into flowers', () => {
      renderCrown(90);

      expect(screen.getAllByTestId('saguaro-blossom')).toHaveLength(11);
    });

    it('leaves the rest as buds', () => {
      renderCrown(90);

      expect(screen.getAllByTestId('saguaro-bud')).toHaveLength(9);
    });
  });

  describe('at 100% understood', () => {
    it('has flowered completely', () => {
      renderCrown(100);

      expect(screen.getAllByTestId('saguaro-blossom')).toHaveLength(20);
    });
  });
});
