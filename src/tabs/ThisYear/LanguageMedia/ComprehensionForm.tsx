import { DisclosureForm } from './DisclosureForm';
import { NumberField } from './NumberField';
import { readNumberIncludingZero } from './fields';
import { Comprehension } from './types';

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
          lookups: readNumberIncludingZero(data, 'lookups') ?? 0,
          aiQuestions: readNumberIncludingZero(data, 'aiQuestions') ?? 0,
          understood: readNumberIncludingZero(data, 'understood'),
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
