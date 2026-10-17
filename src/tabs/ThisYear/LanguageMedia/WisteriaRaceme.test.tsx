import { render, screen } from '@testing-library/react';
import { WisteriaRaceme } from './WisteriaRaceme';

const renderRaceme = (understood: number) =>
  render(
    <svg>
      <WisteriaRaceme
        seed="update"
        base={{ x: 0, y: 0 }}
        understood={understood}
      />
    </svg>,
  );

const countFlorets = () =>
  screen.getByTestId('wisteria-raceme').querySelectorAll('.wisteria-floret')
    .length;

describe('WisteriaRaceme', () => {
  describe('when everything was understood', () => {
    it('has opened every bud', () => {
      renderRaceme(100);

      expect(countFlorets()).toBe(36);
    });
  });

  describe('when about half was understood', () => {
    it('opens the top rows and leaves the rest in bud', () => {
      renderRaceme(50);

      expect(countFlorets()).toBe(21);
      expect(screen.getAllByTestId('wisteria-bud')).toHaveLength(15);
    });
  });
});
