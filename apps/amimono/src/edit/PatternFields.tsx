import { FormControl } from 'shared/controls/FormControl';

import { ProjectDraft } from './projectDraft';

type PatternFieldsProps = {
  draft: ProjectDraft;
  onChange: (changes: Partial<ProjectDraft>) => void;
};

export function PatternFields({ draft, onChange }: PatternFieldsProps) {
  return (
    <div className="pattern-fields">
      <FormControl
        label="Pattern"
        value={draft.patternName}
        onChange={(patternName) => onChange({ patternName })}
      />
      <FormControl
        label="Link"
        inputMode="url"
        value={draft.patternUrl}
        onChange={(patternUrl) => onChange({ patternUrl })}
      />
    </div>
  );
}
