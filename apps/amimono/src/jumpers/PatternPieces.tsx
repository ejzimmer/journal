import { PatternPiece } from './types';

type PatternPiecesProps = {
  pieces: PatternPiece[];
};

export function PatternPieces({ pieces }: PatternPiecesProps) {
  return (
    <div className="pattern-pieces">
      {pieces.map(({ name, steps }) => (
        <section key={name} className="pattern-piece" aria-label={name}>
          <h3>{name}</h3>
          <ol>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
