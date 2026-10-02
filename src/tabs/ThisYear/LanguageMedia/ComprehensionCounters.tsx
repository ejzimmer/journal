import { Comprehension } from './types';

export function ComprehensionCounters({
  name,
  comprehension,
  onChange,
}: {
  name: string;
  comprehension: Comprehension;
  onChange: (changes: Partial<Comprehension>) => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label={`Add a lookup to ${name}`}
        onClick={() => onChange({ lookups: comprehension.lookups + 1 })}
      >
        +1 looked up
      </button>
      <button
        type="button"
        aria-label={`Add an AI question to ${name}`}
        onClick={() => onChange({ aiQuestions: comprehension.aiQuestions + 1 })}
      >
        +1 asked AI
      </button>
    </>
  );
}
