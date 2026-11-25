import { PatternPieces } from './PatternPieces';
import { JumperPattern } from './types';

type SavedPatternsProps = {
  patterns: JumperPattern[];
};

export function SavedPatterns({ patterns }: SavedPatternsProps) {
  return (
    <section className="saved-patterns" aria-label="Saved patterns">
      {patterns.map((pattern) => (
        <details key={pattern.id} className="saved-pattern">
          <summary>{pattern.name}</summary>
          <PatternPieces pieces={pattern.pieces} />
        </details>
      ))}
    </section>
  );
}
