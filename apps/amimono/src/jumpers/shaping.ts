export type ShapingRate = { interval: number; count: number };

export type EvenShaping = {
  rate: ShapingRate;
  spareRows: number;
};

export function planEvenShaping(
  rows: number,
  shapingRows: number,
): EvenShaping {
  const interval = Math.max(1, Math.floor(rows / shapingRows));
  return {
    rate: { interval, count: shapingRows },
    spareRows: Math.max(0, rows - interval * shapingRows),
  };
}

export function planTwoRateShaping(
  rows: number,
  shapingRows: number,
): ShapingRate[] {
  const fastInterval = Math.max(1, Math.floor(rows / shapingRows));
  const slowCount = Math.max(0, rows - fastInterval * shapingRows);
  const rates = [
    { interval: fastInterval + 1, count: slowCount },
    { interval: fastInterval, count: shapingRows - slowCount },
  ];
  return rates.filter(({ count }) => count > 0);
}
