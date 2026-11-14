import './SeaChart.css';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const COLUMNS = [1, 2, 3, 4, 5, 6, 7];

type SeaChartProps = {
  revealedSquares: number[];
  onChange: (revealedSquares: number[]) => void;
};

export function SeaChart({ revealedSquares, onChange }: SeaChartProps) {
  const toggleSquare = (square: number) =>
    onChange(
      revealedSquares.includes(square)
        ? revealedSquares.filter((revealed) => revealed !== square)
        : [...revealedSquares, square].sort((a, b) => a - b),
    );

  return (
    <div className="sea-chart">
      {ROWS.flatMap((row, rowIndex) =>
        COLUMNS.map((column, columnIndex) => {
          const square = rowIndex * COLUMNS.length + columnIndex;
          const isRevealed = revealedSquares.includes(square);
          return (
            <button
              key={square}
              className={isRevealed ? 'revealed' : ''}
              aria-label={`Sea chart ${row}${column}`}
              aria-pressed={isRevealed}
              onClick={() => toggleSquare(square)}
            />
          );
        }),
      )}
    </div>
  );
}
