import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { YarnPileCanvas } from './YarnPileCanvas';
import { PlacedBall } from './bowlWorld';
import { renderWithYarnStorage } from './yarnStorageTestUtils';

const BOWL = { x: 100, y: 20, halfWidth: 90, depth: 60, rimDepth: 10 };

const placeBall = (
  id: number,
  yarnType: 'wool' | 'cotton',
  x: number,
  y: number,
): PlacedBall => ({
  ball: { id, yarnType, grams: 200 },
  x,
  y,
  size: 40,
  angle: 0,
});

const BLEED = 8;

function renderPile(balls: PlacedBall[]) {
  renderWithYarnStorage(
    <YarnPileCanvas balls={balls} bowl={BOWL} width={200} height={100} />,
    { getBalance: (yarnType) => (yarnType === 'cotton' ? 950 : 3191) },
  );
}

const getPileCanvas = () => screen.getByRole('img', { name: 'Pile of yarn' });

describe('YarnPileCanvas', () => {
  describe('when the pointer is over a ball', () => {
    it('shows the details of that ball', async () => {
      const user = userEvent.setup();
      renderPile([
        placeBall(0, 'wool', 60, 50),
        placeBall(1, 'cotton', 110, 50),
      ]);
      const pile = getPileCanvas();

      await user.pointer({
        target: pile,
        coords: { clientX: 110 + BLEED, clientY: 50 + BLEED },
      });

      expect(screen.getByRole('tooltip')).toHaveTextContent('cotton: 950g');
    });

    describe('and then moves off it within the pile', () => {
      it('hides the details', async () => {
        const user = userEvent.setup();
        renderPile([placeBall(0, 'wool', 60, 50)]);
        const pile = getPileCanvas();
        await user.pointer({
          target: pile,
          coords: { clientX: 60 + BLEED, clientY: 50 + BLEED },
        });
        const tooltip = screen.getByRole('tooltip');

        await user.pointer({
          target: pile,
          coords: { clientX: 150 + BLEED, clientY: 50 + BLEED },
        });

        expect(tooltip).not.toBeInTheDocument();
      });
    });

    describe('and then leaves the pile', () => {
      it('hides the details', async () => {
        const user = userEvent.setup();
        renderPile([placeBall(0, 'wool', 60, 50)]);
        const pile = getPileCanvas();
        await user.pointer({
          target: pile,
          coords: { clientX: 60 + BLEED, clientY: 50 + BLEED },
        });
        const tooltip = screen.getByRole('tooltip');

        await user.unhover(pile);

        expect(tooltip).not.toBeInTheDocument();
      });
    });
  });
});
