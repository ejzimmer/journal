import { FormControl } from 'shared/controls/FormControl';

import { PatternDraft } from './projectDraft';

type PatternFieldsProps = {
  pattern: PatternDraft;
  onChange: (pattern: PatternDraft) => void;
};

export function PatternFields({ pattern, onChange }: PatternFieldsProps) {
  return (
    <div className="pattern-fields">
      <FormControl
        label="Pattern"
        value={pattern.name}
        onChange={(name) => onChange({ ...pattern, name })}
      />
      <FormControl
        label="Link"
        inputMode="url"
        value={pattern.url}
        onChange={(url) => onChange({ ...pattern, url })}
      />
    </div>
  );
}
