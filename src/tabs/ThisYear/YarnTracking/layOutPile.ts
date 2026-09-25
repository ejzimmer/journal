import { PileBall } from './pileBalls';
import { GRAMS_PER_BALL } from './utils';

export const BALL_SIZE = 48;

export type PlacedBall = PileBall & { x: number; y: number; size: number };

type SizedBall = PileBall & { size: number };

const sizeBall = (pileBall: PileBall): SizedBall => ({
  ...pileBall,
  size: (BALL_SIZE * pileBall.ball.grams) / GRAMS_PER_BALL,
});

const getRowWidth = (row: SizedBall[]) =>
  row.reduce((total, { size }) => total + size, 0);

function splitIntoRows(balls: SizedBall[], width: number) {
  const rows: SizedBall[][] = [];

  balls.forEach((ball) => {
    const row = rows[rows.length - 1];
    if (row && getRowWidth(row) + ball.size <= width) {
      row.push(ball);
    } else {
      rows.push([ball]);
    }
  });

  return rows;
}

export function layOutPile(pileBalls: PileBall[], width: number) {
  const placed: PlacedBall[] = [];
  let top = 0;

  splitIntoRows(pileBalls.map(sizeBall), width).forEach((row) => {
    const rowHeight = Math.max(...row.map(({ size }) => size));
    let left = (width - getRowWidth(row)) / 2;

    row.forEach((ball) => {
      placed.push({
        ...ball,
        x: left + ball.size / 2,
        y: top + rowHeight - ball.size / 2,
      });
      left += ball.size;
    });
    top += rowHeight;
  });

  return { balls: placed, height: top };
}
