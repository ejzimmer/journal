import { DisclosureForm } from './DisclosureForm';
import { NumberField, readZeroOrMore } from './fields';
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

export function ComprehensionForm({
  name,
  comprehension,
  onChange,
}: {
  name: string;
  comprehension: Comprehension;
  onChange: (changes: Partial<Comprehension>) => void;
}) {
  return (
    <DisclosureForm
      summary="Totals"
      label={`Edit totals for ${name}`}
      onSubmit={(data) =>
        onChange({
          lookups: readZeroOrMore(data, 'lookups') ?? 0,
          aiQuestions: readZeroOrMore(data, 'aiQuestions') ?? 0,
          understood: readZeroOrMore(data, 'understood'),
        })
      }
    >
      <NumberField
        label="Looked up"
        name="lookups"
        defaultValue={comprehension.lookups}
        min={0}
        isRequired
      />
      <NumberField
        label="Asked AI"
        name="aiQuestions"
        defaultValue={comprehension.aiQuestions}
        min={0}
        isRequired
      />
      <NumberField
        label="Understood (%)"
        name="understood"
        defaultValue={comprehension.understood}
        min={0}
        max={100}
      />
    </DisclosureForm>
  );
}
