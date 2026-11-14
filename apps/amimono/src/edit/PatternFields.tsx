import { ProjectDraft } from './projectDraft';

type PatternFieldsProps = {
  draft: ProjectDraft;
  onChange: (changes: Partial<ProjectDraft>) => void;
};

export function PatternFields({ draft, onChange }: PatternFieldsProps) {
  return (
    <div className="pattern-fields">
      <label className="edit-field">
        <span className="field-label">Pattern</span>
        <input
          value={draft.patternName}
          onChange={(event) => onChange({ patternName: event.target.value })}
        />
      </label>
      <label className="edit-field">
        <span className="field-label">Link</span>
        <input
          inputMode="url"
          value={draft.patternUrl}
          onChange={(event) => onChange({ patternUrl: event.target.value })}
        />
      </label>
    </div>
  );
}
